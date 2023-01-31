import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import prisma from './db'

import sampleRouter from './routes/samples'
import teamsRouter from './routes/teams';
import teamsFieldsRouter from './routes/teams_fields';
import teamsLabelsRouter from './routes/teams_labels';
import printersRouter from './routes/printers';
import { getAllSamples } from './controllers/samples'

(async function () {
    const app: express.Express = express()
    const port = 5000;

    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
    app.use(cors());
    
    // ----------------------------------------------
    // NEW ROUTES :>)

    app.use('/:team/samples', sampleRouter);

    app.use('/:team/fields', teamsFieldsRouter);

    app.use('/:team/labels', teamsLabelsRouter);

    app.use('/teams', teamsRouter);

    app.use('/printers', printersRouter);

    app.get('/samples', getAllSamples);

    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })

    prisma.$disconnect()
})();
