import * as coda from "@codahq/packs-sdk";
export const pack = coda.newPack();
const timestamp = require('time-stamp');
const keys = require('./api-keys.json')
const md5 = require('md5');
pack.addNetworkDomain("gateway.marvel.com");
const BASE_URL = "https://gateway.marvel.com"
const IMAGE_FORMAT = "/portrait_uncanny.jpg"
const public_key = keys.publickey
const private_key = keys.privatekey

// Schema for a Characters image.
const CharactersSchema = coda.makeObjectSchema({
  properties: {
    thumbnail: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference,
    },
    name: {
      type: coda.ValueType.String,
    },
    id: { type: coda.ValueType.Number },
    description: { type: coda.ValueType.String },
  },
  displayProperty: "thumbnail",
  featuredProperties: ["name", "id","description"],
  idProperty: "id",
});


pack.addSyncTable({
  name: "Characters",
  identityName: "Characters",
  schema: CharactersSchema,
  connectionRequirement: coda.ConnectionRequirement.None,
  formula: {
    name: "getcharacters",
    description: "Returns all the Marvel characters",
    parameters: [],
    execute: async function ([], context) {
      let final_url = BASE_URL+"/v1/public/characters"
      let ts = timestamp.utc();
      let hash = md5(ts+private_key+public_key)
      let url = coda.withQueryParams(final_url, {
        ts: ts,
        apikey: public_key,
        hash: hash
      });
      let response = await context.fetcher.fetch({
        method: "GET",
        url: url,
      });
      const results = response.body.data.results;
      const data = [];
      for (let obj in results)
      {
        let id = results[obj].id
        let name = results[obj].name
        let description = results[obj].description
        let thumbnail = results[obj].thumbnail.path+IMAGE_FORMAT
        data.push({
          thumbnail: thumbnail,
          id: id,
          name: name,
          description: description
        })
    }
      return {
        result: data,
      };
    },
  },
});

 