import { RequestHandler } from "express";
import prisma, { STATUS, teamIsActive } from "../db";
import { Sample } from "@prisma/client";

/**
 * Base route /:team/samples
 */

// [x] create
// [x] delete
// [x] update
// [x] get all /:team/samples
// [x] get one /:team/samples/:id

// Need to think of a different route for this.
// Currently clashes with get one sample
// [~] get deleted, route: /:team/samples/deleted

// [x] get history, route: /:team/samples/:id/audit

export const getAllSamples: RequestHandler = async (req, res) => {

    const deletedAuditIDs = (await prisma.deleted.groupBy({
        by: ["audit_id"],
        _sum: {
            status: true
        }
    })).filter((group) => group._sum.status! > 0)
       .map((group) => group.audit_id!);

    const sampleGroups = (await prisma.sample.groupBy({
        by: ["team_name", "audit_id"],
        _max: {
            audit_number: true
        },
    })).filter((group) => !deletedAuditIDs.includes(group.audit_id))
       .map((group) => {
            return {
                team_name: group.team_name,
                audit_id: group.audit_id,
                audit_number: group._max.audit_number!
            }
        }
    );

    const samples = await prisma.sample.findMany({
        where: {
            OR: sampleGroups
        }
    });

    const groupedByTeam: { [key: string]: Sample[] } = {};

    for (const sample of samples) {
        if (groupedByTeam[sample.team_name]) {
            groupedByTeam[sample.team_name].push(sample);
        } else {
            groupedByTeam[sample.team_name] = [sample];
        }
    };

    res.status(200).json(groupedByTeam);
}

export const getTeamsSamples: RequestHandler = async (req, res) => {
    const { team } = req.params;

    const teamExists = await teamIsActive(team);

    if (!teamExists) 
        return res.status(404).json({ message: `Team "${team}" not found` });

    // Our first goal is to get all the audit ids of deleted samples for this team.
    // This will allow us to filter out the deleted samples later on.
    // We must also check that the status is > 0 since deleted samples can be restored.
    const deletedAuditIDs = (await prisma.deleted.groupBy({
        by: ["audit_id"],
        where: {
            team_name: team
        },
        _sum: {
            status: true
        }
    })).filter((group) => group._sum.status! > 0)
       .map((group) => group.audit_id!);

    // Now we want to get the newest audit number for each audit id that is not deleted
    const newestNonDeletedSamples = (await prisma.sample.groupBy({
        by: ["audit_id"],
        where: {
            team_name: team,
            audit_id: {
                notIn: deletedAuditIDs
            }
        },
        _max: {
            audit_number: true
        },
    })).map((group) => { 
        return { 
            audit_id: group.audit_id, 
            audit_number: group._max.audit_number! 
        }
    });

    // Now we can get all the newest versions of samples that arent deleted
    const samples = await prisma.sample.findMany({
        where: {
            OR: newestNonDeletedSamples
        }
    });

    res.status(200).json(samples);
}

export const getSample: RequestHandler = async (req, res) => {
    const { team, id } = req.params;

    const teamExists = await teamIsActive(team);

    if (!teamExists)
        return res.status(404).json({ message: `Team "${team}" not found` });

    const sample = await prisma.sample.findUnique({
        where: {
            id
        }
    });

    if (!sample)
        return res.status(404).json({ message: `Sample "${id}" not found` });

    // If this samples audit id is in the deleted table, then it is deleted
    const isDeleted = await prisma.deleted.groupBy({
        by: ["audit_id"],
        where: {
            audit_id: sample.audit_id
        },
        _sum: {
            status: true
        }
    });

    if (isDeleted.length > 0 && isDeleted[0]._sum.status! == 0)
        return res.status(404).json({ message: `Sample "${id}" not found` });

    res.status(200).json(sample);
}

export const getAuditTrail: RequestHandler = async (req, res) => {
    const { team, id } = req.params;

    const teamExists = await teamIsActive(team);

    if (!teamExists)
        return res.status(404).json({ message: `Team "${team}" not found` });

    const sample = await prisma.sample.findUnique({
        where: {
            id
        },
        select: {
            audit_id: true
        }
    });

    if (!sample)
        return res.status(404).json({ message: `Sample "${id}" not found` });

    const auditTrail = await prisma.sample.findMany({
        where: {
            audit_id: sample.audit_id
        },
    });

    // Make the highest audit number first (newest)
    auditTrail.sort((a, b) => b.audit_number - a.audit_number);

    res.status(200).json(auditTrail);
}

export const getDeletedSamples: RequestHandler = async (req, res) => {
    const { team } = req.params;

    const teamExists = await teamIsActive(team);

    if (!teamExists)
        return res.status(404).json({ message: `Team "${team}" not found` });

    const deletedSamples = await prisma.deleted.findMany({
        where: {
            team_name: team
        }
    });

    res.status(200).json(deletedSamples);
}

export const createSample: RequestHandler = async (req, res) => {
    const { team } = req.params;

    const teamExists = await teamIsActive(team);

    if (!teamExists) 
        return res.status(404).json({ message: `Team "${team}" not found` });

    // There is a possibility here to add validation for the "data" column.
    // We would get all the active fields for the team and validate the data against that.    

    const data = req.body;

    const sample = await prisma.sample.create({
        data: {
            team_name: team,
            data
        }
    });

    res.status(201).json(sample);
}

export const updateSample: RequestHandler = async (req, res) => {
    const { team, id } = req.params;

    const teamExists = await teamIsActive(team);

    if (!teamExists)
        return res.status(404).json({ message: `Team "${team}" not found` });

    const sample = await prisma.sample.findUnique({
        where: {
            id
        }
    });

    if (!sample)
        return res.status(404).json({ message: `Sample "${id}" not found` });

    const isDeleted = await prisma.deleted.groupBy({
        by: ["audit_id"],
        where: {
            audit_id: sample.audit_id
        },
        _sum: {
            status: true
        }
    });

    if (isDeleted.length > 0 && isDeleted[0]._sum.status! == 0)
        return res.status(404).json({ message: `Sample "${id}" not found` });

    const newSampleData = {
        expiration_date: sample.expiration_date,
        team_name: sample.team_name,
        ...req.body,
        data: {
            ...(sample.data as object),
            ...req.body.data
        },
        audit_id: sample.audit_id,
        date_created: sample.date_created
    }

    const newSample = await prisma.sample.create({
        data: newSampleData
    });

    res.status(200).json(newSample);
}

export const deleteSample: RequestHandler = async (req, res) => {
    const { team, id } = req.params;

    const teamExists = await teamIsActive(team);

    if (!teamExists) 
        return res.status(404).json({ message: `Team "${team}" not found` });

    const sample = await prisma.sample.findUnique({
        where: {
            id
        }
    });

    if (!sample)
        return res.status(404).json({ message: `Sample "${id}" not found` });

    const isDeleted = await prisma.deleted.groupBy({
        by: ["audit_id"],
        where: {
            audit_id: sample.audit_id
        },
        _sum: {
            status: true
        }
    });

    if (isDeleted.length > 0 && isDeleted[0]._sum.status! == 0)
        return res.status(404).json({ message: `Sample "${id}" not found` });

    await prisma.deleted.create({
        data: {
            audit_id: sample.audit_id,
            team_name: team,
            status: STATUS.CREATE
        }
    });

    res.status(200).json(sample);
}