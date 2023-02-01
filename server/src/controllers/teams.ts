import { RequestHandler } from "express";
import prisma from "../db";

export const getTeams: RequestHandler = async (req, res) => {
    const teams = await prisma.team.findMany();

    res.status(200).json(teams);
}

export const createTeam: RequestHandler = async (req, res) => {
    const { name } = req.body;

    const team = await prisma.team.create({
        data: {
            name,
        },
    });

    res.status(200).json(team);
}

export const deleteTeam: RequestHandler = async (req, res) => {
    const { name } = req.params;

    const team = await prisma.team.delete({
        where: {
            name
        }
    });

    if (!team)
        return res.status(404).json({ message: `No team with name "${name}" was found` });

    res.status(200).json(team);
}

export const updateTeam: RequestHandler = async (req, res) => {
    const { name } = req.params;
    const { name: newName } = req.body;

    const team = await prisma.team.update({
        where: {
            name
        },
        data: {
            name: newName
        }
    });

    if (!team)
        return res.status(404).json({ message: `No team with name "${name}" was found` });

    res.status(200).json(updateTeam);
}