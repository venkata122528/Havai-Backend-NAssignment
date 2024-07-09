const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "havaHavai.db");
let db = null;

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on port number 3000.");
    });
  } catch (error) {
    console.log(`DB Error ${error}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/airport/", async (request, response) => {
  const { iata_code } = request.query;

  const toGetAirportDataQuery = `SELECT * FROM airport WHERE iata_code LIKE '${iata_code}';`;
  const toGetCityData = `SELECT city.id,city.name,city.country_id,city.is_active,city.lat,city.long FROM airport INNER JOIN city ON airport.city_id=city.id WHERE airport.iata_code LIKE '${iata_code}';`;
  const toGetCountryData = `SELECT country.id,country.name,country.country_code_two,country.country_code_three,country.mobile_code,country.continent_id FROM country INNER JOIN airport ON country.id=airport.country_id WHERE airport.iata_code LIKE '${iata_code}';`;
  const airportData = await db.get(toGetAirportDataQuery);
  const cityDataResponse = await db.get(toGetCityData);
  const countryDataResponse = await db.get(toGetCountryData);
  let cityData;
  let countryData;

  if (cityDataResponse === undefined) {
    cityData = null;
  } else {
    cityData = {
      id: cityDataResponse.id,
      name: cityDataResponse.name,
      country_id: cityDataResponse.country_id,
      is_active: cityDataResponse.is_active,
      lat: cityDataResponse.lat,
      long: cityDataResponse.long,
    };
  }

  if (countryDataResponse === undefined) {
    countryData = null;
  } else {
    countryData = {
      id: countryDataResponse.id,
      name: countryDataResponse.name,
      country_code_two: countryDataResponse.country_code_two,
      country_code_three: countryDataResponse.country_code_three,
      mobile_code: countryDataResponse.mobile_code,
      continent_id: countryDataResponse.continent_id,
    };
  }

  result = {
    airport: {
      id: airportData.id,
      icao_code: airportData.icao_code,
      iata_code: airportData.iata_code,
      name: airportData.name,
      type: airportData.type,
      latitude_deg: airportData.latitude_deg,
      longitude_deg: airportData.longitude_deg,
      elevation_ft: airportData.elevation_ft,
      address: {
        city: cityData,
        country: countryData,
      },
    },
  };

  response.send(result);
});
