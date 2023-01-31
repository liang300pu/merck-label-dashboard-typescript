/**
 * base route /printers
 * - create
 * - delete
 * - get
 * - update
 */

import { RequestHandler } from "express";
import prisma, { STATUS } from "../db";

export const getPrinters: RequestHandler = async (req, res) => {

    const activePrinters = (await prisma.printer.groupBy({
        by: ["ip"],
        _max: {
            id: true
        },
        _sum: {
            status: true
        }
    })).filter(printer => printer._sum.status! > 0);

    const printers = await prisma.printer.findMany({
        where: {
            id: {
                in: activePrinters.map(printer => printer._max.id!)
            }
        }
    });

    res.status(200).json(printers);
}

export const createPrinter: RequestHandler = async (req, res) => {
    const { ip, name, location } = req.body;

    const printer = await prisma.printer.create({
        data: {
            ip,
            name,
            location,
            status: STATUS.CREATE
        }
    });

    res.status(201).json(printer);
}

export const deletePrinter: RequestHandler = async (req, res) => {
    const { ip } = req.params;

    const printers = await prisma.printer.groupBy({
        by: ["ip"],
        where: {
            ip
        },
        _max: {
            id: true
        },
        _sum: {
            status: true
        },
    });

    if (!printers || printers.length == 0)
        return res.status(404).json({ message: `Printer "${ip}" not found` });

    if (printers[0]._sum.status! == 0)
        return res.status(404).json({ message: `Printer "${ip}" not found` });

    const printer = await prisma.printer.findUnique({
        where: {
            id: printers[0]._max.id!
        }
    });

    await prisma.printer.create({
        data: {
            ip,
            name: printer!.name,
            location: printer!.location,
            status: STATUS.DELETE
        }
    });

    res.status(200).json({ message: `Printer "${ip}" deleted` });
}

export const updatePrinter: RequestHandler = async (req, res) => {
    const { ip } = req.params;
    const { name, location } = req.body;

    const printers = await prisma.printer.groupBy({
        by: ["ip"],
        where: {
            ip
        },
        _max: {
            id: true
        },
        _sum: {
            status: true
        },
    });

    if (!printers || printers.length == 0)
        return res.status(404).json({ message: `Printer "${ip}" not found` });

    if (printers[0]._sum.status! == 0)
        return res.status(404).json({ message: `Printer "${ip}" not found` });

    const printer = await prisma.printer.findUnique({
        where: {
            id: printers[0]._max.id!
        }
    });

    await prisma.printer.create({
        data: {
            ip,
            name: printer!.name,
            location: printer!.location,
            status: STATUS.DELETE
        }
    });

    await prisma.printer.create({
        data: {
            ip,
            name: name ?? printer!.name,
            location: location ?? printer!.location,
            status: STATUS.CREATE
        }
    });

    res.status(200).json({ message: `Printer "${ip}" updated` });
}