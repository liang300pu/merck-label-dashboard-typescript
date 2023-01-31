import { RequestHandler } from "express";
import prisma from "../db";

export const getLabels: RequestHandler = async (req, res) => {
    const { team } = req.params;

    const labelGroups = await prisma.label.groupBy({
        by: ["team_name", "width", "length"],
        where: {
            team_name: team
        },
        _max: {
            id: true
        }
    });

    const labels = await prisma.label.findMany({
        where: {
            id: {
                in: labelGroups.map((label) => label._max.id!)
            }   
        }
    });

    res.status(200).json(labels);
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