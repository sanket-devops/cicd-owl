import { Iuser } from "./interfaces/Iuser";
import Fastify from "fastify";
import cors from "@fastify/cors";
import mongoose from "mongoose";

const fastify = Fastify();
fastify.register(cors, {
  // put your options here
});
const hostname = "0.0.0.0";
const port = 8888;
const app = fastify;
const userModel = require("./models/user.model");
const hostModel = require("./models/host.model");
const cicdModel = require("./models/cicd.model");
const db =
  "mongodb://service-owl:ecivreS8002lwO@192.168.10.108:27017/cicd-owl?authSource=admin";
mongoose.set("strictQuery", true);
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

const makeToken = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
let token: any = makeToken(48);

setInterval(() => {
  token = makeToken(48);
  // console.log(token)
}, 60000 * 1440);

/////////////////////////////////////////////////////////////////////

//GET Cicds Items
app.get("/cicds", async (req, res) => {
  try {
    // let hosts = await owlModel.serviceHost.find({}).sort({_id:-1});
    // let hosts = await owlModel.serviceHost.find({}).select('ipAddress hostName port hostMetrics.DiskFree hostMetrics.MemFree hostMetrics.CpuUsage linkTo userName userPass groupName clusterName envName vmName note status hostCheck metricsCheck createdAt updatedAt').sort({_id:-1});
    let cicds = await cicdModel.cicdData.find({});
    // res.send({data: getEncryptedData(hosts)});
    res.send({ data: cicds });
  } catch (e) {
    res.status(500);
  }
});

//POST Cicd Item
app.post("/cicds/cicd-save", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    // console.log(req.body.data)
    let tempData = JSON.parse(JSON.stringify(req.body.data));
    let saved = await cicdModel.cicdData.create(tempData);
    res.send(saved);
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

//UPDATE Cicd Item
app.put("/cicds/update", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    let tempData = JSON.parse(JSON.stringify(req.body.data));
    let id = JSON.parse(JSON.stringify(req.body.id));
    let post = await cicdModel.cicdData.findOneAndUpdate(
      { _id: id },
      tempData,
      { new: true, runValidator: true }
    );
    res.send(post);
  } catch (e) {
    res.status(500);
  }
});

//DELETE Cicd Item
app.post("/cicds/cicd-delete", async (req: any, res) => {
  try {
    // console.log(JSON.parse(JSON.stringify(req.body.data)))
    let post = await cicdModel.cicdData.findByIdAndRemove({
      _id: JSON.parse(JSON.stringify(req.body.data)),
    });
    res.send(post);
  } catch (e) {
    res.status(500);
  }
});

/////////////////////////////////////////////////////////////////////
//GET Users
app.get("/users", async (req, res) => {
  try {
    // let hosts = await owlModel.serviceHost.find({}).sort({_id:-1});
    // let hosts = await owlModel.serviceHost.find({}).select('ipAddress hostName port hostMetrics.DiskFree hostMetrics.MemFree hostMetrics.CpuUsage linkTo userName userPass groupName clusterName envName vmName note status hostCheck metricsCheck createdAt updatedAt').sort({_id:-1});
    let users = await userModel.userData.find({});
    // res.send({data: getEncryptedData(hosts)});
    res.send({ data: users });
  } catch (e) {
    res.status(500);
  }
});

//POST Save User
app.post("/users/user-save", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    // console.log(req.body.data)
    let tempData = JSON.parse(JSON.stringify(req.body.data));
    let saved = await userModel.userData.create(tempData);
    res.send(saved);
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

//UPDATE User
app.put("/users/update", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    let tempData = JSON.parse(JSON.stringify(req.body.data));
    let id = JSON.parse(JSON.stringify(req.body.id));
    let post = await userModel.userData.findOneAndUpdate(
      { _id: id },
      tempData,
      { new: true, runValidator: true }
    );
    res.send(post);
  } catch (e) {
    res.status(500);
  }
});

//DELETE User
app.post("/users/user-delete", async (req: any, res) => {
  try {
    // console.log(JSON.parse(JSON.stringify(req.body.data)))
    let post = await userModel.userData.findByIdAndRemove({
      _id: JSON.parse(JSON.stringify(req.body.data)),
    });
    res.send(post);
  } catch (e) {
    res.status(500);
  }
});

//POST Login User token validation
app.post("/users/login/token", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    // console.log(req.body.data)
    let userToken = JSON.parse(JSON.stringify(req.body.data));
    if (userToken === token) {
      console.log(token);
      res.send({ token: "Token Validate" });
    } else {
      console.log(token);
      res.status(401);
      res.send({ token: "Token Invalidate..." });
    }
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

//POST Login User
app.post("/users/login", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    // console.log(req.body.data)
    let postData = JSON.parse(JSON.stringify(req.body.data));
    let userData = await userModel.userData.findOne({
      userName: postData.userName,
    });
    if (await userData) {
      // console.log(await userData)
      if (
        postData.userName === userData.userName &&
        postData.userPass === userData.userPass
      ) {
        res.send({ token: token });
      } else {
        res.status(401);
        res.send({ error: "Incorrect password check your password..." });
      }
    } else {
      res.status(401);
      res.send({ error: "User Not Found..." });
    }
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

/////////////////////////////////////////////////////////////////////
//GET Host
app.get("/hosts", async (req, res) => {
  try {
    // let hosts = await owlModel.serviceHost.find({}).sort({_id:-1});
    // let hosts = await owlModel.serviceHost.find({}).select('ipAddress hostName port hostMetrics.DiskFree hostMetrics.MemFree hostMetrics.CpuUsage linkTo userName userPass groupName clusterName envName vmName note status hostCheck metricsCheck createdAt updatedAt').sort({_id:-1});
    let hosts = await hostModel.hostData.find({});
    // res.send({data: getEncryptedData(hosts)});
    res.send({ data: hosts });
  } catch (e) {
    res.status(500);
  }
});

//POST Save Host
app.post("/hosts/host-save", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    // console.log(req.body.data)
    let tempData = JSON.parse(JSON.stringify(req.body.data));
    let saved = await hostModel.hostData.create(tempData);
    res.send(saved);
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

//UPDATE Host
app.put("/hosts/update", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    let tempData = JSON.parse(JSON.stringify(req.body.data));
    let id = JSON.parse(JSON.stringify(req.body.id));
    let post = await hostModel.hostData.findOneAndUpdate(
      { _id: id },
      tempData,
      { new: true, runValidator: true }
    );
    res.send(post);
  } catch (e) {
    res.status(500);
  }
});

//DELETE Host
app.post("/hosts/host-delete", async (req: any, res) => {
  try {
    // console.log(JSON.parse(JSON.stringify(req.body.data)))
    let post = await hostModel.hostData.findByIdAndRemove({
      _id: JSON.parse(JSON.stringify(req.body.data)),
    });
    res.send(post);
  } catch (e) {
    res.status(500);
  }
});

/////////////////////////////////////////////////////////////////////

async function ssh(cicdStages: any, baseDir: string, id: any) {
  let stageData: any = undefined;
  let cicd = await cicdModel.cicdData.findOne({ _id: id });
  let buildNumber = cicd.cicdStagesOutput.length + 1;
  let _cicdStageOutput: any = {
    buildNumber: buildNumber,
    startTime: Date.now(),
    endTime: Date.now(),
    status: "success",
    cicdStageOutput: [],
  };
  let resDataPromiseArr1: any = [];
  resDataPromiseArr1.push(
    new Promise(async (resolve: any, reject: any) => {
      cicdStages.forEach(async (element: any) => {
        let host = await hostModel.hostData.findOne({
          hostName: element.remoteHost,
        });
        let output = await sshConnect(await host, await element.command);
        // console.log(await output);
        let _stageLogs: any = {
          stageName: element.stageName,
          startTime: Date.now(),
          endTime: Date.now(),
          status: "success",
          logs: [],
        };
        let resDataPromiseArr: any = [];
        resDataPromiseArr.push(
          new Promise(async (resolve: any, reject: any) => {
            _stageLogs.logs.push(
              await JSON.parse(JSON.stringify("" + (await output)))
            );
            _cicdStageOutput.cicdStageOutput.push(_stageLogs);

            // console.log(_cicdStageOutput);
            stageData = await _cicdStageOutput;
            // console.log(stageData);
            // await cicdModel.cicdData.findByIdAndUpdate(
            //   { _id: id },
            //   { $push: { cicdStagesOutput: _cicdStageOutput } }
            // );
            resolve(await _cicdStageOutput);
          })
        );
        await Promise.all(resDataPromiseArr).then((value) => {
          // console.log(value)
          stageData = value;
          resolve(stageData);
        });
      });
      
    })
  );
  await Promise.all(resDataPromiseArr1).then((value) => {
    console.log(stageData);
    // stageData = value;
  });
  return stageData;
}

async function sshConnect(host: any, command: string) {
  let output: any = [];
  let outputCode: number = -1;
  const { Client } = require("ssh2");
  const conn = new Client();
  let resDataPromiseArr: any = [];
  resDataPromiseArr.push(
    new Promise(async (resolve: any, reject: any) => {
      conn
        .on("ready", async () => {
          console.log("Client :: ready");

          conn.exec(command, async (err: any, stream: any) => {
            if (err) throw err;
            stream
              .on("close", async (code: any, signal: any) => {
                console.log(
                  "Stream :: close :: code: " +
                    (await code) +
                    ", signal: " +
                    (await signal)
                );
                outputCode = await code;
                conn.end();
                resolve();
              })
              .on("data", async (data: any) => {
                // console.log('STDOUT: ' + data);
                output.push(await data);
              })
              .stderr.on("data", async (data: any) => {
                // console.log('STDERR: ' + data);
                output.push(await data);
              });
          });
        })
        .connect({
          host: host.hostAdd,
          port: 22,
          username: host.hostUser,
          password: host.hostPass,
        });
    })
  );
  await Promise.all(resDataPromiseArr);
  // console.log(await output)
  return await output;
}

/////////////////////////////////////////////////////////////////////

//POST Connect SSH
app.post("/connect/ssh", async (req: any, res) => {
  try {
    let body = JSON.parse(JSON.stringify(req.body));
    let output = await ssh(body.cicdStages, body.baseDir, body.id);
    // console.log(output);
    res.send(output);
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

//POST Connect SSH and store output in cicdStagesOutput using _id
// app.post("/connect/ssh", async (req: any, res) => {
//   try {
//     let body = JSON.parse(JSON.stringify(req.body));
//     let output = await ssh(
//       body.host,
//       body.port,
//       body.user,
//       body.pass,
//       body.baseDir,
//       body.command,
//       body.id
//     );
//     console.log(output);
//     res.send(output);
//   } catch (e) {
//     console.log(e);
//     res.status(500);
//     res.send({ message: e.message });
//   }
// });

/////////////////////////////////////////////////////////////////////
