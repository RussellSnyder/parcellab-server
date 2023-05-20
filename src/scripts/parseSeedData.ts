import { Status } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { promises as fs } from 'fs';
import { zipObject } from 'lodash';

const SEED_DATA_DIR = __dirname + '/../../seedData/';

async function loadAndParseCsvFile<T>(fileLocation: string): Promise<T[]> {
  // Read File
  const rawCsv = await fs.readFile(fileLocation, 'utf-8');
  // Parse CSV
  const parsedFile = parse(rawCsv, { delimiter: ';' });

  const trackingColumns = parsedFile[0];
  const trackingDataArray = parsedFile.slice(1);

  // return array of key/value objects
  return trackingDataArray.map((trackingData) =>
    zipObject(trackingColumns, trackingData),
  );
}

export interface CheckpointFromCsv {
  tracking_number: string;
  location: string;
  timestamp: string;
  status: Status;
  status_text: string;
  status_details: string;
}

export interface TrackingFromCsv {
  orderNo: string;
  tracking_number: string;
  courier: string;
  street: string;
  zip_code: string;
  city: string;
  destination_country_iso3: string;
  email: string;
  articleNo: string;
  articleImageUrl: string;
  quantity: string;
  product_name: string;
}

export interface SeedData {
  trackings: TrackingFromCsv[];
  checkpoints: CheckpointFromCsv[];
}

export const loadSeedData = async (): Promise<SeedData> => {
  const seedDataFiles = await fs.readdir(SEED_DATA_DIR);

  const promises = [];

  seedDataFiles.forEach((filename) => {
    const csvFileToParse = `${SEED_DATA_DIR}${filename}`;
    promises.push(loadAndParseCsvFile(csvFileToParse));
  });

  const parsedCsvFiles = await Promise.all(promises);

  // structure the data so that the key is the filename
  const seedDataFileNames = seedDataFiles.map((file) => file.split('.')[0]);
  const data = zipObject(seedDataFileNames, parsedCsvFiles);

  return data;
};
