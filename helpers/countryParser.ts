// import axios from "axios";
import { promises as fs } from "fs";
import { parseStringPromise } from "xml2js";
import * as path from "path";

// const url = "https://www.artlebedev.ru/country-list/xml/";
const filePath = path.resolve(__dirname, "countries.xml");

export async function fetchAndParseXML() {
  try {
    // const response = await axios.get(url);
    const xmlData = await fs.readFile(filePath, "utf-8");

    const result = await parseStringPromise(xmlData);

    const countryList = result["country-list"].country;
    const countryIsoMapping: Record<string, string> = {};

    countryList.forEach((country: any) => {
      const name = country.name[0];
      const isoCode = country.iso[0];
      countryIsoMapping[name] = isoCode;
    });

    console.log(countryIsoMapping);

    return countryIsoMapping;
  } catch (error) {
    console.error("Error fetching or parsing XML:", error);
    return {};
  }
}

fetchAndParseXML();
