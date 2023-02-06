import { RequestHandler } from "express";
import prisma from "../db";
import { Label } from "@prisma/client";
import { generateLabelImageWithLayoutAndSample } from "../brother/label_generation";
import path from "path";
import { sendLabelsToPrinter } from "../brother/ipp_printing";

export const getAllLabels: RequestHandler = async (req, res) => {
    const groupedLabels = await prisma.label.groupBy({
        by: ["team_name", "width", "length"],
        _max: {
            id: true
        }
    });

    const labels = await prisma.label.findMany({
        where: {
            id: {
                in: groupedLabels.map((label) => label._max.id!)
            }
        }
    });

    const teams = (await prisma.team.findMany()).map((team) => team.name);

    const groupedByTeam: Record<string, Label[]> = {};

    for (const team of teams) {
        groupedByTeam[team] = labels.filter((label) => label.team_name == team);
    }

    res.status(200).json(groupedByTeam);
}

export const getLabels: RequestHandler = async (req, res) => {
    const { team } = req.params;

    const { width, length } = req.query;

    const whereQuery: any = {
        team_name: team
    };

    if (width && length) {
        whereQuery.width = Number(width);
        whereQuery.length = Number(length);
    }

    const labelGroups = await prisma.label.groupBy({
        by: ["team_name", "width", "length"],
        where: whereQuery,
        _max: {
            id: true
        }
    });

    if (labelGroups.length == 0) {
        return res.status(404).json({ message: `No labels found for team "${team}"` });
    }

    const labels = await prisma.label.findMany({
        where: {
            id: {
                in: labelGroups.map((label) => label._max.id!)
            }   
        }
    });

    res.status(200).json((width && length) ? labels[0] : labels);
}

export const createLabel: RequestHandler = async (req, res) => {
    const { team } = req.params;
    const { width, length, data } = req.body;

    const label = await prisma.label.create({
        data: {
            team_name: team,
            width,
            length,
            data
        }
    });

    res.status(201).json(label);
}

export const generateLabelImage: RequestHandler = async (req, res) => {
    var { team_name, sample_id, width, length } = req.body;

    const sample = await prisma.sample.findFirst({
        where: {
            id: sample_id
        }
    });

    if (team_name == null && sample == null) {
        return res.status(404).json({ message: `No sample found with id "${sample_id}"` });
    }

    if (team_name == null) {
        team_name = sample!.team_name;
    }

    const newestLabelWithGivenSize = (await prisma.label.groupBy({
        by: ["team_name", "width", "length"],
        where: {
            team_name,
            width: Number(width),
            length: Number(length)
        },
        _max: {
            id: true
        }
    })).find((label) => label.team_name === team_name);

    const labelLayout = await prisma.label.findFirst({
        where: {
            id: newestLabelWithGivenSize?._max.id!
        }
    });

    try {
        const label = await generateLabelImageWithLayoutAndSample(labelLayout!, sample!);

        const base64 = (await label.toBuffer()).toString("base64");
    
        res.status(200).json(base64);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    };

}

export const printLabels: RequestHandler = async (req, res) => {
    const { images, printer } = req.body;

    try {
        const success = await sendLabelsToPrinter(images, printer);
        res.status(200).json({ success });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

// export const deleteLabel: RequestHandler = async (req, res) => {

// }