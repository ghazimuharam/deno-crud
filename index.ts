import { init, MongoClient } from "https://deno.land/x/mongo@v0.6.0/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

await init();

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");
const db = client.database("deno");
const cats = db.collection("cats");

export const getCats = async (context: any) => {
  context.response.body = {"msg" : "success", "data" : await cats.find()};
};

export const findCats = async (context: any) => {
  let findCats = await cats.findOne({ name: context.params.name });
  context.response.body = {"msg" : "success", "data" : findCats};
};

export const updateCats = async (context: any) => {
  const data = await context.request.body();
  const { matchedCount, modifiedCount, upsertedId } = await cats.updateOne(
    { name: context.params.name },
    { $set: { age: data.value.age } },
  );
  context.response.body = {
    "msg": "Cats updated successfully",
  };
};

export const insertCats = async (context: any) => {
  const data = await context.request.body();
  const insertCats = await cats.insertOne({
    name: data.value.name,
    age: data.value.age,
  });
  context.response.body = { "msg": "Cats added" };
};

export const deleteCats = async (context: any) => {
  const deleteCount = await cats.deleteOne({ name: context.params.name });
  if (deleteCount == 1) {
    context.response.body = { "msg": "Cats deleted" };
  } else {
    if (!cats.findOne({ name: context.params.name })) {
      context.response.body = { "msg": "Cats not found" };
    } else {
      context.response.body = { "msg": "an error occured" };
    }
  }
};

const router = new Router();
router
  .get("/cats", getCats)
  .post("/cats", insertCats)
  .get("/cats/:name", findCats)
  .put("/cats/:name", updateCats)
  .delete("/cats/:name", deleteCats);

const app = new Application();
const PORT = 4000;

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`listening on port ${PORT}`);
await app.listen({ port: PORT });
