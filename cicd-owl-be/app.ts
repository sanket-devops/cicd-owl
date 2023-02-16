import { Iuser } from "./interfaces/Iuser";
import Fastify from "fastify";
import mongoose from "mongoose";

const fastify = Fastify();
const hostname = "0.0.0.0";
const port = 8888;
const app = fastify;
const userModel = require("./models/user.model");
const db =
  "mongodb://service-owl:ecivreS8002lwO@192.168.10.108:27017/cicd-owl?authSource=admin";
mongoose.set('strictQuery', true);
mongoose
  .connect(db, {
    // promiseLibrary: Promise,
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log(`MongoDB Connected: ${db}`))
  .catch(console.error);

app.listen({ port: port, host: hostname }, function () {
  console.log(`service-owl app listen at : http://${hostname}:${port}`);
});
app.get("/", (req, res) => {
  res.send(`CICD-OWL Is Running...`);
});

//GET Users
app.get('/users', async (req, res) => {
    try {
        // let hosts = await owlModel.serviceHost.find({}).sort({_id:-1});
        // let hosts = await owlModel.serviceHost.find({}).select('ipAddress hostName port hostMetrics.DiskFree hostMetrics.MemFree hostMetrics.CpuUsage linkTo userName userPass groupName clusterName envName vmName note status hostCheck metricsCheck createdAt updatedAt').sort({_id:-1});
        let hosts = await userModel.userData.find({});
        // res.send({data: getEncryptedData(hosts)});
        res.send({data: hosts});
    } catch (e) {
        res.status(500);
    }
});

//POST Save User
app.post('/users/user-save', async (req: any, res) => {
    try {
        // let tempData = JSON.parse(getDecryptedData(req.body.data));
        // console.log(req.body.data)
        let tempData = JSON.parse(JSON.stringify(req.body.data));
        let saved = await userModel.userData.create(tempData);
        res.send(saved);
    } catch (e) {
        console.log(e);
        res.status(500);
        res.send({message: e.message});
    }
});

//UPDATE User
app.put('/users/update', async (req: any, res) => {
    try {
        // let tempData = JSON.parse(getDecryptedData(req.body.data));
        let tempData = JSON.parse(JSON.stringify(req.body.data));
        let id = JSON.parse(JSON.stringify(req.body.id));
        console.log(id)
        let post = await userModel.userData.findOneAndUpdate({_id: id}, tempData, {new: true, runValidator: true});
        res.send(post);
    } catch (e) {
        res.status(500);
    }
});

//DELETE User
app.post('/users/user-delete', async (req: any, res) => {
    try {
        // console.log(JSON.parse(JSON.stringify(req.body.data)))
        let post = await userModel.userData.findByIdAndRemove({
            _id: JSON.parse(JSON.stringify(req.body.data))
        });
        res.send(post);
    } catch (e) {
        res.status(500);
    }
});