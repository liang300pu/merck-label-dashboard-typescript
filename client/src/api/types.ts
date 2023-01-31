export interface GeneralSample {
    qr_code_key: string,
    audit_id: string,
    audit_number: number,
    date_entered: string,
    date_modified: string,
    expiration_date: string,
}

export interface OldSample extends GeneralSample {
    experiment_id: string,
    storage_condition: string,
    contents: string,
    analyst: string,
}

export interface PSample extends GeneralSample {
    sample_name: string,
    mk: string,
    eln_notebook_number: string,
}

export interface Printer {
    ip: string,
    name: string,
    location: string,
    model: string
}

export interface Sample {
    id: string;
    audit_id: string;
    audit_number: number;
    date_created: Date;
    date_modified: Date;
    expiration_date: Date;
    team_name: string;
    data: {
        [key: string]: any;
    }
}

export type CreateSampleRequirements = Pick<Sample, "data">