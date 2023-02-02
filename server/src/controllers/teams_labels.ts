import { RequestHandler } from "express";
import prisma from "../db";
import { Label } from "@prisma/client";

export const getAllLabels: RequestHandler = async (req, res) => {
    const labels = await prisma.label.findMany();

    const teams = (await prisma.team.findMany()).map((team) => team.name);

    const groupedByTeam: Record<string, Label[]> = {};

    for (const team of teams) {
        groupedByTeam[team] = labels.filter((label) => label.team_name == team);
    }

    res.status(200).json(labels);
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

// export const deleteLabel: RequestHandler = async (req, res) => {

// }