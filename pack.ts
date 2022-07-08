import * as coda from "@codahq/packs-sdk";
export const pack = coda.newPack();
pack.addNetworkDomain("gogoanime.herokuapp.com");
const BASE_URL = "https://gogoanime.herokuapp.com/";

// Schema for a Anime Details
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
      type: coda.ValueType.Array,
      items: { type: coda.ValueType.String}
    },
    image: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference,
    },
   
  },
  displayProperty: "image",
  idProperty: "image",
});

// Schema for Anime Episodes
const AnimeEpisodesSchema = coda.makeObjectSchema({
  properties: {
    episodeId: {
      type: coda.ValueType.String,
    },
    episodeNum: {
      type: coda.ValueType.Number,
    },
  },
  displayProperty: "episodeNum",
  featuredProperties: ["episodeId"],
  idProperty: "episodeId",
});

// Schema for Popular Anime
const PopularAnimeSchema = coda.makeObjectSchema({
  properties: {
    animeId: {
      type: coda.ValueType.String,
    },
    animeTitle: {
      type: coda.ValueType.String,
    },
    animeImg: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference
    },
  },
  displayProperty: "animeId",
  featuredProperties: ["animeTitle","animeImg"],
  idProperty: "animeId",
});

// Schema for Anime Search
const AnimeSearchSchema = coda.makeObjectSchema({
  properties: {
    animeId: {
      type: coda.ValueType.String,
    },
    animeTitle: {
      type: coda.ValueType.String,
    },
    status: {
      type: coda.ValueType.String,
    },
    animeImg: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference
    },
  },
  displayProperty: "animeId",
  featuredProperties: ["animeTitle","status","animeImg"],
  idProperty: "animeId",
});

// Schema for Anime Movies
const AnimeMoviesSchema = coda.makeObjectSchema({
  properties: {
    animeId: {
      type: coda.ValueType.String,
    },
    animeTitle: {
      type: coda.ValueType.String,
    },
    releasedDate: {
      type: coda.ValueType.String,
    },
    animeImg: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference
    },
  },
  displayProperty: "animeId",
  featuredProperties: ["animeTitle","releasedDate","animeImg"],
  idProperty: "animeId",
});

// Formula to get the details of the anime
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
      image: response.body.animeImg,
      totalEpisodes: response.body.totalEpisodes,
      genres: response.body.genres
    };
  },
});

// Formula to watch the anime
pack.addFormula({
  name: "WatchAnime",
  description: "Returns the video of the anime to watch. Input should be valid episode id",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "name",
      description: "The episode id",
    }),
  ],
  resultType: coda.ValueType.String,
  codaType: coda.ValueHintType.Embed,
  execute: async function ([name], context) {
    let finalurl = BASE_URL+"vidcdn/watch/"+name
    let response = await context.fetcher.fetch({
      method: "GET",
      url: finalurl,
    });
    return response.body.sources[0].file
  },
});
 
// Sync table to print the episode details of an anime
pack.addSyncTable({
  name: "Episodedetails",
  identityName: "Episodedetails",
  schema: AnimeEpisodesSchema,
  formula: {
    name: "Episodedetails",
    description: "Returns the details of all the Episodes of an anime",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "name",
        description: "The name of the anime",
      }),
    ],
    execute: async function ([name], context) {
      let finalurl = BASE_URL+"anime-details/"+name
      let response = await context.fetcher.fetch({
        method: "GET",
        url: finalurl,
      });
      const data = response.body.episodesList
      data.sort((a,b) => { 
        return a.episodeNum - b.episodeNum;
      });
      return {
        result: data
      };
    },
  },
});

// Sync table to print current the Popular Animes
pack.addSyncTable({
  name: "PopularAnimes",
  identityName: "PopularAnimes",
  schema: PopularAnimeSchema,
  formula: {
    name: "PopularAnime",
    description: "Returns the current popular animes",
    parameters: [],
    execute: async function ([], context) {
      let finalurl = BASE_URL+"popular"
      let response = await context.fetcher.fetch({
        method: "GET",
        url: finalurl,
      });
      const data = response.body
      return {
        result: data
      };
    },
  },
});

// Sync table to Search for Animes
pack.addSyncTable({
  name: "Search",
  identityName: "SearchResults",
  schema: PopularAnimeSchema,
  formula: {
    name: "SearchAnime",
    description: "Returns anime infomation",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "name",
        description: "Search string",
      }),
    ],
    execute: async function ([name], context) {
      let finalurl = BASE_URL+"search?keyw="+name
      let response = await context.fetcher.fetch({
        method: "GET",
        url: finalurl,
      });
      const data = response.body
      return {
        result: data
      };
    },
  },
});

// Sync table to get all the Anime Movies details
pack.addSyncTable({
  name: "AnimeMovies",
  identityName: "AnimeMovies",
  schema: PopularAnimeSchema,
  formula: {
    name: "AnimeMovies",
    description: "Returns the movies of the animes",
    parameters: [],
    execute: async function ([], context) {
      let finalurl = BASE_URL+"anime-movies"
      let response = await context.fetcher.fetch({
        method: "GET",
        url: finalurl,
      });
      const data = response.body
      return {
        result: data
      };
    },
  },
});

// Sync table to print the details of an anime by genre
pack.addSyncTable({
  name: "GetAnimeByGenre",
  identityName: "Animeedetails",
  schema: AnimeMoviesSchema,
  formula: {
    name: "GetAnimeByGenre",
    description: "Returns the details of the animes associated with the genre",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "name",
        description: "The genre for the anime.Supported genres - action,adventure,cars,comedy,crime,dementia,demons,drama,dub, \
        ecchi,family,fantasy,game,gourmet,harem,historical,horror,josei,kids,magic,martial-arts,mecha,military,Mmusic,mystery, \
        parody,police,psychological,romance,samurai,school,sci-fi,seinen,shoujo,shoujo-ai,shounen,shounen-ai,slice-of-Life,space, \
        sports,super-power,supernatural,suspense,thriller,vampire,yaoiyuri"
      }),
    ],
    execute: async function ([name], context) {
      let finalurl = BASE_URL+"genre/"+name
      let response = await context.fetcher.fetch({
        method: "GET",
        url: finalurl,
      });
      const data = response.body
      return {
        result: data
      };
    },
  },
});