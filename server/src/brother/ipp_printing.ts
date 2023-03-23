import Jimp from 'jimp'
import { BrotherQLPrinter } from './printer'
import { BrotherQLRaster, BrotherQLRasterImages } from './raster'
import { Printer } from '@prisma/client'

export function formatPrinterURL(printer: Printer) {
    return `http://${printer.ip}:631/ipp/print`
}

export async function sendLabelsToPrinter(
    images: {
        base64: string
        quantity: number
    }[],
    printer: Printer,
    labelOptions?: {
        width: number
        length: number
    }
) {
    const brotherPrinter = new BrotherQLPrinter(formatPrinterURL(printer))
    const printerAttributes = await brotherPrinter.getAttributes()

    // Printer took too long to respond or we couldnt connect
    if (printerAttributes === undefined) {
        return false
    }

    // @ts-ignore
    const mediaName: string =
        printerAttributes['printer-attributes-tag']['media-ready']

    var [width, length] = [labelOptions?.width, labelOptions?.length]
    if (!labelOptions)
        [width, length] = RegExp(/(\d+)x(\d+)/)
            .exec(mediaName)!
            .slice(1)
            .map(Number)

    const jimpImages: Jimp[] = []

    for (const image of images) {
        const imageBuffer = await Jimp.read(Buffer.from(image.base64, 'base64'))
        for (let i = 0; i < image.quantity; i++) {
            jimpImages.push(imageBuffer)
        }
    }

    const raster = new BrotherQLRaster({
        media: {
            width: width!,
            length: length!,
            type: 'DieCut',
        },
        images: jimpImages as BrotherQLRasterImages,
    }).addAll()

    const buffer = raster.buildBuffer()

    const success = await brotherPrinter.print(buffer)

    return success ?? false
}
