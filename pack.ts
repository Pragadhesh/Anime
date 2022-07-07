import * as coda from "@codahq/packs-sdk";
export const pack = coda.newPack();
pack.addNetworkDomain("gogoanime.herokuapp.com");
const BASE_URL = "https://gogoanime.herokuapp.com/";

// Schema for a Anime Name
const AnimeDetailsSchema = coda.makeObjectSchema({
  properties: {
    animeTitle: {
      type: coda.ValueType.String,
    },
    type: {
      type: coda.ValueType.String,
    },
    releasedDate: {
      type: coda.ValueType.String,
    },
    status: {
      type: coda.ValueType.String,
    },
    otherNames: {
      type: coda.ValueType.String,
    },
    synopsis: {
      type: coda.ValueType.String,
    },
    totalEpisodes: { type: coda.ValueType.Number },
    genres: {
      type: coda.ValueType.String
    },
    animeImg: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference,
    },
   
  },
  displayProperty: "animeImg",
  featuredProperties: ["animeTitle","type","releasedDate","status","otherNames","synopsis","totalEpisodes"],
  idProperty: "animeTitle",
});

//Formula to get the details of the anime
pack.addFormula({
  name: "Animedetails",
  description: "Gets the details of the anime",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "name",
      description: "The name of the anime",
    }),
  ],
  resultType: coda.ValueType.Object,
  schema: AnimeDetailsSchema,

  execute: async function ([name], context) {
    let finalurl = BASE_URL+"anime-details/"+name
    let response = await context.fetcher.fetch({
      method: "GET",
      url: finalurl,
    });
    return {
      animeTitle: response.body.animeTitle,
      type: response.body.type,
      releasedDate: response.body.releasedDate,
      status: response.body.status,
      otherNames: response.body.otherNames,
      synopsis: response.body.synopsis,
      animeImg: response.body.animeImg,
      totalEpisodes: response.body.totalEpisodes,
      //genres: response.body.genres
    };
  },
});
 