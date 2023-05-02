import { Iuser } from "./interfaces/Iuser";
import Fastify from "fastify";
import cors from "@fastify/cors";
import mongoose from "mongoose";
import WebSocket, { WebSocketServer } from "ws";

const fastify = Fastify();
fastify.register(cors, {
  // put your options here
});
const hostname = "0.0.0.0";
const port = 8888;
const WebSocketPort = 8800;
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
  console.log(`Cicd-Owl-Api listen at : http://${hostname}:${port}`);
});

const wss = new WebSocketServer({ port: WebSocketPort }, function () {
  console.log(`Cicd-Owl-Wss listen at : http://${hostname}:${WebSocketPort}`);
});

wss.on('connection', (ws, req) => {
  // Handles new connection
  let clientIp = req.socket.remoteAddress;
  console.log(`WS Client ${clientIp} is Connected...`)
  ws.on('message', (data) => {
    console.log(`Recived message from client: ${data}`);
    ws.send(`Server: Yes I am ${data}`)
  })
  ws.send(`Hello, This is WS from Cicd-Owl...`)
  ws.on('error', console.error);
  ws.on('close', function close() {
    console.log(`WS Client ${clientIp} is Disconnected...`);
  });
})

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
    let cicds = await cicdModel.cicdData
      .find({})
      .select("itemName status cicdStages createdAt updatedAt")
      .sort({ _id: -1 });
    // res.send({data: getEncryptedData(hosts)});
    res.send({ data: cicds });
  } catch (e) {
    res.status(500);
  }
});

//GET Cicd StagesOutput By Id
app.post("/cicds/cicd-stages", async (req: any, res) => {
  try {
    // console.log(JSON.parse(JSON.stringify(req.body.data)))
    let _cicdStagesOutput = await cicdModel.cicdData
      .findOne({
        _id: JSON.parse(JSON.stringify(req.body.data)),
      })
      .select("cicdStagesOutput");
    res.send(_cicdStagesOutput);
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
  } catch (e: any) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

//UPDATE Cicd Item
app.put("/cicds/update", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    let tempData = JSON.parse(JSON.stringify(req.body));
    console.log(tempData);
    // let id = JSON.parse(JSON.stringify(req.body.id));
    let post = await cicdModel.cicdData.findOneAndUpdate(
      { _id: tempData._id },
      {
        $set: { itemName: tempData.itemName, cicdStages: tempData.cicdStages },
      },
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
  } catch (e: any) {
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
  } catch (e: any) {
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
  } catch (e: any) {
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
  } catch (e: any) {
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

async function ssh(cicdStages: any, id: any) {
  let cicd = await cicdModel.cicdData.findOne({ _id: id });
  cicd.status = "running";
  let buildNumber = cicd.cicdStagesOutput.length + 1;

  let _cicdStageOutput: any = {
    buildNumber: buildNumber,
    startTime: Date.now(),
    endTime: null,
    status: "running",
    cicdStageOutput: [],
  };
  cicd.cicdStagesOutput.push(_cicdStageOutput);
  let connEnd = false;
  let output: any = undefined;

  for (let index = 0; index < cicdStages.length; index++) {
    let _stageLogs: any = {
      stageName: cicdStages[index].stageName,
      startTime: Date.now(),
      endTime: null,
      status: "running",
      code: null,
      logs: [],
    };
    let host = await hostModel.hostData.findOne({
      hostName: cicdStages[index].remoteHost,
    });
    let _cicdHostPath = `mkdir -p ${await host.hostPath}/cicd-owl/${await cicd.itemName} && cd ${await host.hostPath}/cicd-owl/${await cicd.itemName}`;
    let sshCommand = _cicdHostPath + " && " + cicdStages[index].command;
    // console.log(sshCommand);

    if (output && output.code != 0) {
      break;
      // console.log(output.code)
    } else {
      if (index === cicdStages.length - 1) connEnd = true;
      output = await sshConnect(await host, sshCommand, connEnd);
      let resDataPromiseArr: any = [];
      resDataPromiseArr.push(
        new Promise(async (resolve: any, reject: any) => {
          _stageLogs.logs.push(
            await JSON.parse(JSON.stringify("" + output.output))
            // await output.output
          );
          _stageLogs.code = output.code;
          if (output.code === 0) {
            _stageLogs.status = "success";
            _cicdStageOutput.status = "success";
          } else {
            _stageLogs.status = "failed";
            _cicdStageOutput.status = "failed";
            cicd.status = "failed";
          }
          _stageLogs.endTime = Date.now();
          _cicdStageOutput.cicdStageOutput.push(_stageLogs);
          // stageData = await _cicdStageOutput;
          resolve();
        })
      );
      await Promise.all(resDataPromiseArr);
      _cicdStageOutput.endTime = Date.now();
    }
    for (const stage of cicd.cicdStagesOutput) {
      if (stage.buildNumber === buildNumber)
        stage.cicdStageOutput.push(await _stageLogs);
    }
    await cicdModel.cicdData.findOneAndUpdate({ _id: id }, cicd, {
      new: true,
      runValidator: true,
    });
  }
  cicd.status = await _cicdStageOutput.status;
  await cicdModel.cicdData.findOneAndUpdate({ _id: id }, cicd, {
    new: true,
    runValidator: true,
  });
  return await cicd;
}

async function sshConnect(host: any, command: string, connEnd: boolean) {
  let output: any = [];
  let outputCode: number = -1;
  const { Client } = require("ssh2");
  const conn = new Client();
  let resDataPromiseArr: any = [];
  resDataPromiseArr.push(
    new Promise(async (resolve: any, reject: any) => {
      conn
        .on("ready", async () => {
          console.log("Client :: Ready Command is:\n" + command);

          conn.exec(command, async (err: any, stream: any) => {
            if (err) throw err;
            stream
              .on("close", async (code: any, signal: any) => {
                outputCode = await code;
                resolve();
                if (connEnd) {
                  console.log(
                    "Connection End: All Commands Are Successfully RUN => (code: " +
                      (await code) +
                      ", signal: " +
                      (await signal) +
                      ")"
                  );
                  conn.end();
                } else if ((await code) != 0) {
                  console.log(
                    "Connection End: Last Command Failed => (code: " +
                      (await code) +
                      ", signal: " +
                      (await signal) +
                      ")"
                  );
                  conn.end();
                }
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
          port: host.hostPort,
          username: host.hostUser,
          password: host.hostPass,
        });
    })
  );
  await Promise.all(resDataPromiseArr);
  let resData = { output: await output, code: outputCode };
  // console.log(await JSON.parse(JSON.stringify("" + resData.output)));
  // console.log(resData.output);
  return resData;
}

/////////////////////////////////////////////////////////////////////

// POST Connect SSH
app.post("/connect/ssh", async (req: any, res) => {
  try {
    let body = JSON.parse(JSON.stringify(req.body.data));
    let output = await ssh(body.cicdStages, body.id);
    res.send(output);
  } catch (e: any) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

// POST Connect SSH and store output in cicdStagesOutput using _id
app.post("/connect/ssh/test", async (req: any, res) => {
  try {
    let body = JSON.parse(JSON.stringify(req.body.data));
    if (body.remoteHost) {
      let host = await hostModel.hostData.findOne({
        hostName: body.remoteHost,
      });
      let _cicdHostPath = `mkdir -p ${await host.hostPath}/cicd-owl/testTemp && cd ${await host.hostPath}/cicd-owl/testTemp`;
      let sshCommand = _cicdHostPath + " && " + body.command;
      // console.log(sshCommand);
      let connEnd = true;
      let output = await sshConnect(host, sshCommand, connEnd);
      res.send({
        output: await JSON.parse(JSON.stringify("" + output.output)),
        code: output.code,
      });
    } else {
      res.send({
        output: "Please select the host to run stage...",
        code: 1,
      });
    }
  } catch (e: any) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

/////////////////////////////////////////////////////////////////////
