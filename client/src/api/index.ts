import axios from 'axios'
import { 
    Team,
    CreateTeamRequirements,
    UpdateTeamRequirements,
    Sample,
    CreateSampleRequirements,
    UpdateSampleRequirements,
    TeamField,
    CreateTeamFieldRequirements,
    TeamLabel,
    CreateTeamLabelRequirements,
    Printer,
    CreatePrinterRequirements,
    UpdatePrinterRequirements, 
} from './types';

const baseURL = 'http://localhost:5000' as const;

const baseSamplesURL = `${baseURL}/samples/` as const;
const baseTeamsURL = `${baseURL}/teams/` as const;
const basePrintersURL = `${baseURL}/printers/` as const;
const baseFieldsURL = `${baseURL}/fields/` as const;
const baseLabelsURL = `${baseURL}/labels/` as const;


// * @route /teams
 
/**
 * @returns All teams currently in the database that are not deleted
 */
async function getAllTeams(): Promise<Team[]> {
    const { data: teams } = await axios.get(baseTeamsURL);
    return teams;
}

/**
 * 
 * @param info 
 * @returns The new team that was created
 */
async function createTeam(info: CreateTeamRequirements): Promise<Team> {
    const { data: newTeam } = await axios.post(baseTeamsURL, info);
    return newTeam;
}

/**
 * All this does is change a teams name
 * @param team 
 * @returns The updated team
 */
async function updateTeam(team_name: string, team: UpdateTeamRequirements): Promise<Team> {
    const { data: updatedTeam } = await axios.put(`${baseTeamsURL}/${team_name}`, team);
    return updatedTeam;
}

/**
 * 
 * @param team_name 
 * @returns The team that was deleted
 */
async function deleteTeam(team_name: string): Promise<Team> {
    const { data } = await axios.delete(`${baseTeamsURL}/${team_name}`);   
    return data;
}


// ----------------------------------------

// * @route /samples

/**
 * 
 * @returns A key value pair of team names and their samples
 */
async function getAllSamples(): Promise<Record<string, Sample[]>> {
    const { data } = await axios.get(baseSamplesURL);
    return data;
}

async function getSample(id: string): Promise<Sample> {
    const { data: sample } = await axios.get(`${baseSamplesURL}`, {
        params: {
            id
        }
    });
    return sample;
}

async function getTeamSamples(team: string): Promise<Sample[]> {
    const { data: samples } = await axios.get(`${baseSamplesURL}/`, {
        params: {
            team
        }
    });
    return samples;
}

async function getTeamSample(team: string, id: string): Promise<Sample> {
    const { data: sample } = await axios.get(`${baseSamplesURL}/`, {
        params: {
            team,
            id
        }
    });
    return sample;
}

async function getAuditSamples(id: string): Promise<Sample[]> {
    const { data: samples } = await axios.get(`${baseSamplesURL}/${id}/audit`);
    return samples;
}

async function createSample(sample: CreateSampleRequirements): Promise<Sample> {
    const { data: newSample } = await axios.post(`${baseSamplesURL}`, sample);
    return newSample;
}

async function updateSample(id: string, sample: UpdateSampleRequirements): Promise<Sample> {
    const { data: updatedSample } = await axios.put(`${baseSamplesURL}/${id}`, sample);
    return updatedSample;
}

async function deleteSample(id: string): Promise<Sample> {
    const { data: deletedSample } = await axios.delete(`${baseSamplesURL}/${id}`);
    return deletedSample;
}

// ----------------------------------------

// * @route /fields

async function getAllFields(): Promise<Record<string, TeamField[]>> {
    const { data: fields } = await axios.get(baseFieldsURL);
    return fields;
}

async function getTeamFields(team: string): Promise<TeamField[]> {
    const { data: fields } = await axios.get(`${baseFieldsURL}/${team}`);
    return fields;
}

async function getTeamField(team: string, field_id: number | string): Promise<TeamField> {
    const { data: field } = await axios.get(`${baseFieldsURL}/${team}/${field_id}`);
    return field;
}

async function createTeamField(field: CreateTeamFieldRequirements): Promise<TeamField> {
    const { data: newField } = await axios.post(baseFieldsURL, field);
    return newField;
}

async function updateTeamField(field_id: number | string, field: TeamField): Promise<TeamField> {
    const { data: updatedField } = await axios.put(`${baseFieldsURL}/${field_id}`, field);
    return updatedField;
}

async function deleteTeamField(field_id: number | string): Promise<TeamField> {
    const { data: deletedField } = await axios.delete(`${baseFieldsURL}/${field_id}`);
    return deletedField;
}

// ----------------------------------------

// * @route /:team/labels

async function getTeamLabels(team: string): Promise<TeamLabel> {
    const { data: labels } = await axios.get(`${baseLabelsURL}/${team}`);
    return labels;
}

async function getTeamLabel(team: string, width: number, length: number): Promise<TeamLabel> {
    const { data: label } = await axios.get(`${baseLabelsURL}/${team}/`, {
        params: {
            width,
            length
        }
    });
    return label;
}

async function createTeamLabel(team: string, label: CreateTeamLabelRequirements): Promise<TeamLabel> {
    const { data: newLabel } = await axios.post(`${baseLabelsURL}/${team}`, {
        ...label,
        team_name: team
    });
    return newLabel;
}

// ----------------------------------------

// * @route /printers

async function getAllPrinters(): Promise<Printer[]> {
    const { data: printers } = await axios.get(basePrintersURL);
    return printers;
}

async function getPrinter(ip: string): Promise<Printer> {
    const { data: printer } = await axios.get(`${basePrintersURL}/${ip}`);
    return printer;
}

async function createPrinter(printer: CreatePrinterRequirements): Promise<Printer> {
    const { data: newPrinter } = await axios.post(basePrintersURL, printer);
    return newPrinter;
}

async function updatePrinter(ip: string, printer: UpdatePrinterRequirements): Promise<Printer> {
    const { data: updatedPrinter } = await axios.put(`${basePrintersURL}/${ip}`, printer);
    return updatedPrinter;
}

async function deletePrinter(ip: string): Promise<Printer> {
    const { data: deletedPrinter } = await axios.delete(`${basePrintersURL}/${ip}`);
    return deletedPrinter;
}

export {
    getAllTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getAllSamples,
    getTeamSamples,
    getTeamSample,
    getAuditSamples,
    createSample,
    updateSample,
    deleteSample,
    getTeamFields,
    getTeamField,
    createTeamField,
    updateTeamField,
    deleteTeamField,
    getTeamLabels,
    createTeamLabel,
    getAllPrinters,
    getPrinter,
    createPrinter,
    updatePrinter,
    deletePrinter,
}

export * from './types';


// TODO: Replace any with proper types

// const samplesURL = `${baseURL}/arnd_samples`

// export const fetchSamples = () => axios.get(samplesURL)
// export const createSample = (newSampleData: any) => axios.post(samplesURL, newSampleData)
// export const updateSample = (newSapleDate: any) => axios.put(samplesURL, newSapleDate)

// const psamplesURL = `${baseURL}/pscs_samples`

// export const fetchPSamples = () => axios.get(psamplesURL)
// export const createPSample = (newSampleData: any) => axios.post(psamplesURL, newSampleData)
// export const updatePSample = (newSapleDate: any) => axios.put(psamplesURL, newSapleDate)

// const qrURL = `${baseURL}/qr`

// export const createQRCodeKey = (sample: any) => axios.post(`${qrURL}/key`, sample)
// export const createLabel = (sample: any, team: "ARND" | "PSCS") => axios.post(`${qrURL}/label/${team}`, sample)

// export const fetchPrinters = () => axios.get(`${qrURL}/printers`)
// export const printLabels = (base64labels: string[], printer: Printer) => axios.post(`${qrURL}/print`, { base64labels, printer })

// const deletedURL = `${baseURL}/deleted`;

// export const fetchDeleted = () => axios.get(deletedURL);
// export const fetchDeletedByTeam = (team: "ARND" | "PSCS") => axios.get(`${deletedURL}/${team}`)
// export const createDeleted = (deleted: any) => axios.post(deletedURL, deleted);

// const labelsURL = `${baseURL}/labels`;

// export const setLabelDesign = (information: any, type: string) => axios.post(labelsURL, { information, team: type });