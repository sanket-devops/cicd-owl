import { Iuser } from "./interfaces/Iuser";
import Fastify from "fastify";
import cors from "@fastify/cors";
import mongoose from "mongoose";
// import WebSocket, { CLOSING, WebSocketServer } from "ws";
import { setInterval } from "timers";
import Queue from "./services/Queue";
import schedule from "node-schedule";
const cron = require("node-cron");
var Stream = require("stream");
// const { Client } = require("ssh2");
const ssh2 = require("ssh2");
const connections: any = [];
const fastify = Fastify();
fastify.register(cors, {
  // put your options here
});
const hostname = "0.0.0.0";
const port = 8888;
// const WebSocketPort = 8800;
const app = fastify;
const userModel = require("./models/user.model");
const hostModel = require("./models/host.model");
const cicdModel = require("./models/cicd.model");
const buildQueue = new Queue();
let buildRunning: boolean = false;
let currentbuildItem: any = {
  _id: "",
  itemName: "",
  status: "",
  stageName: "",
  remoteHost: "",
  buildNumber: 0,
  command: "",
};
let currentbuildItems: any = [];
let nextBuildHost: any = {
  hostName: "",
  executors: 0,
};
let nextBuildHosts: any = [];

const db =
  "mongodb://service-owl:ecivreS8002lwO@192.168.10.108:27017/cicd-owl?authSource=admin";
mongoose.set("strictQuery", true);
mongoose
  .connect(db, {
    // promiseLibrary: Promise,
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`MongoDB Connected: ${db}`);
  })
  .catch(console.error);

app.listen({ port: port, host: hostname }, function () {
  console.log(`Cicd-Owl-Api listen at : http://${hostname}:${port}`);
});

// const wss = new WebSocketServer({ port: WebSocketPort }, function () {
//   console.log(`Cicd-Owl-Wss listen at : http://${hostname}:${WebSocketPort}`);
// });

// wss.on('connection', (ws, req) => {
//   // Handles new connection
//   let clientIp = req.socket.remoteAddress;
//   console.log(`WS Client ${clientIp} is Connected...`)
//   ws.on('message', (data) => {
//     console.log(`Recived message from client: ${data}`);
//     ws.send(`Server: Yes I am ${data}`)
//   })
//   ws.send(`Hello, This is WS from Cicd-Owl...`)
//   ws.on('error', console.error);
//   ws.on('close', function close() {
//     console.log(`WS Client ${clientIp} is Disconnected...`);
//   });
// })

const jobs = new Map([]);
async function initCronJob() {
  let cronJobCicds = await cicdModel.cicdData
    .find({})
    .select("itemName status cronJob cicdStages");
  for (let index = 0; index < cronJobCicds.length; index++) {
    if (cron.validate(cronJobCicds[index].cronJob)) {
      jobs.set(cronJobCicds[index].itemName, {
        schedule: cronJobCicds[index].cronJob,
        task: () => buildQueue.enqueue(cronJobCicds[index]),
      });
    } else if (cronJobCicds[index].cronJob === "") {
      let jobName = cronJobCicds[index].itemName;
      jobs.delete(jobName);
    }
  }
  jobs.forEach((value: any, key: any) => {
    schedule.scheduleJob(key, value.schedule, () => {
      value.task();
    });
  });
}
initCronJob();

async function restartScheduler() {
  await schedule.gracefulShutdown();
  await initCronJob();
  return schedule.scheduledJobs;
}

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

// wss.on("connection", async (ws, req) => {
//   // Handles new connection
//   let clientIp = req.socket.remoteAddress;
//   console.log(`WS Client ${clientIp} is Connected...`);
//   setInterval( async () => {
//     try {
//       let cicds = await cicdModel.cicdData
//         .find({})
//         .select("itemName status cicdStages createdAt updatedAt")
//         .sort({ _id: -1 });
//         ws.send(JSON.stringify(cicds));
//         // console.log("Reload fresh data");
//     } catch (e) {
//       console.log(e);
//     }
//   }, 10000);
//   // ws.send(`Hello, This is WS from Cicd-Owl...`)
//   ws.on("error", console.error);
//   ws.on("close", function close() {
//     console.log(`WS Client ${clientIp} is Disconnected...`);
//   });
// });

//GET Cicds Items
app.get("/cicds", async (req, res) => {
  try {
    // let hosts = await owlModel.serviceHost.find({}).sort({_id:-1});
    // let hosts = await owlModel.serviceHost.find({}).select('ipAddress hostName port hostMetrics.DiskFree hostMetrics.MemFree hostMetrics.CpuUsage linkTo userName userPass groupName clusterName envName vmName note status hostCheck metricsCheck createdAt updatedAt').sort({_id:-1});
    let cicds = await cicdModel.cicdData
      .find({})
      .select("itemName status cronJob cicdStages createdAt updatedAt")
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

//POST Cicd Item save
app.post("/cicds/cicd-save", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    // console.log(req.body.data)
    let tempData = JSON.parse(JSON.stringify(req.body.data));
    let saved = await cicdModel.cicdData.create(tempData);
    await restartScheduler();
    res.send(saved);
  } catch (e: any) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

//UPDATE Cicd Item update
app.put("/cicds/update", async (req: any, res) => {
  try {
    // let tempData = JSON.parse(getDecryptedData(req.body.data));
    let tempData = JSON.parse(JSON.stringify(req.body));
    console.log(tempData);
    // let id = JSON.parse(JSON.stringify(req.body.id));
    let post = await cicdModel.cicdData.findOneAndUpdate(
      { _id: tempData._id },
      {
        $set: {
          itemName: tempData.itemName,
          cronJob: tempData.cronJob,
          cicdStages: tempData.cicdStages,
        },
      },
      { new: true, runValidator: true }
    );
    res.send(post);
    let doUpdate = async () => {
      if (buildRunning) {
        setTimeout(doUpdate, 1000);
      } else {
        await cicdModel.cicdData.findOneAndUpdate(
          { _id: tempData._id },
          {
            $set: {
              itemName: tempData.itemName,
              cronJob: tempData.cronJob,
              cicdStages: tempData.cicdStages,
            },
          },
          { new: true, runValidator: true }
        );
      }
    };
    doUpdate();
    await restartScheduler();
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
    await restartScheduler();
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

setInterval(async () => {
  let hostReadyCounter = 0;
  let buildItem = buildQueue.front();

  if (buildItem && buildItem.cicdStages) {
    for (const stage of buildItem.cicdStages) {
      let host = await hostModel.hostData.findOne({
        hostName: stage.remoteHost,
      });

      if (host.executors > 0) {
        stage.cicdId = buildItem._id;
        hostReadyCounter++;
        await hostModel.hostData.findOneAndUpdate(
          { _id: host._id },
          { $push: { buildItems: stage }, $inc: { executors: -1 } }
        );
      } else {
        await hostModel.hostData.findOneAndUpdate(
          { _id: host._id },
          { $inc: { executors: +hostReadyCounter } }
        );
        break;
      }
    }
    if (buildItem.cicdStages.length === hostReadyCounter) {
      console.log("Host ready to Run SSH");
      await startBuild();
    } else {
      console.log("Host not ready to Run SSH");
    }
  }
}, 10000);

async function startBuild() {
  try {
    let buildItem = buildQueue.front();
    buildQueue.dequeue();

    let cicdStages = buildItem.cicdStages;
    let id = buildItem._id;

    let cicd = await cicdModel.cicdData.findOne({ _id: id });
    let buildNumber = cicd.cicdStagesOutput.length + 1;

    let _cicdStageOutput: any = {
      buildNumber: buildNumber,
      startTime: new Date(),
      endTime: null,
      status: "running",
      cicdStageOutput: [],
    };
    await cicdModel.cicdData.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: "running",
        },
      },
      { new: true, runValidator: true }
    );
    await cicdModel.cicdData.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          cicdStagesOutput: _cicdStageOutput,
        },
      },
      { new: true, runValidator: true }
    );
    let connEnd = false;
    let output: any = undefined;
    let hostPathWithGit: string = "";

    currentbuildItem._id = id;
    currentbuildItem.buildNumber = buildNumber;
    currentbuildItem.itemName = cicd.itemName;
    currentbuildItem.status = "running";

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

      buildRunning = true;

      currentbuildItem.stageName = cicdStages[index].stageName;
      currentbuildItem.remoteHost = cicdStages[index].remoteHost;

      let _cicdHostPath = `mkdir -p ${await host.hostPath}/cicd-owl/${await cicd.itemName} && cd ${await host.hostPath}/cicd-owl/${await cicd.itemName}`;
      let sshCommand: string = "";

      if (cicdStages[index].command.includes("git")) {
        var mySubString = cicdStages[index].command.substring(
          cicdStages[index].command.lastIndexOf("/") + 1,
          cicdStages[index].command.lastIndexOf(".git")
        );
        sshCommand = `${_cicdHostPath} && ${cicdStages[index].command}`;
        hostPathWithGit = `${_cicdHostPath} && cd ${mySubString}`;
      } else {
        if (hostPathWithGit) {
          sshCommand = `${hostPathWithGit} && ${cicdStages[index].command}`;
        } else {
          sshCommand = `${_cicdHostPath} && ${cicdStages[index].command}`;
        }
      }
      if (output && output.code != 0) {
        break;
        // console.log(output.code)
      } else {
        if (index === cicdStages.length - 1) connEnd = true;
        currentbuildItem.command = sshCommand;
        currentbuildItems.push(currentbuildItem);
        let connectionName = `${buildNumber}-${buildItem.itemName}`;
        output = await sshConnect(
          await host,
          sshCommand,
          connEnd,
          connectionName
        );
        currentbuildItems.pop();
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
            } else if (output.code > 0) {
              _stageLogs.status = "failed";
              _cicdStageOutput.status = "failed";
              await cicdModel.cicdData.findOneAndUpdate(
                { _id: id },
                {
                  $set: {
                    status: "failed",
                  },
                },
                { new: true, runValidator: true }
              );
            } else {
              _stageLogs.status = "stopped";
              _cicdStageOutput.status = "stopped";
              await cicdModel.cicdData.findOneAndUpdate(
                { _id: id },
                {
                  $set: {
                    status: "stopped",
                  },
                },
                { new: true, runValidator: true }
              );
            }
            _stageLogs.endTime = Date.now();
            _cicdStageOutput.cicdStageOutput.push(_stageLogs);
            resolve();
          })
        );
        await Promise.all(resDataPromiseArr);
      }
      let cicdAgain = await cicdModel.cicdData.findOne({ _id: id });
      for (const stage of cicdAgain.cicdStagesOutput) {
        if (stage.buildNumber === buildNumber)
          stage.cicdStageOutput.push(await _stageLogs);
      }
      await cicdModel.cicdData.findOneAndUpdate({ _id: id }, cicdAgain, {
        new: true,
        runValidator: true,
      });
      await hostModel.hostData.findOneAndUpdate(
        { _id: host._id },
        {
          $pull: { buildItems: { _id: cicdStages[index]._id } },
          $inc: { executors: +1 },
        }
      );
      buildRunning = false;
    }
    await cicdModel.cicdData.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: await _cicdStageOutput.status,
        },
      },
      { new: true, runValidator: true }
    );
  } catch (error) {
    console.log(error);
  }
  currentbuildItem = {
    _id: "",
    itemName: "",
    status: "",
    stageName: "",
    remoteHost: "",
    buildNumber: 0,
    command: "",
  };
}

// let conn: any = undefined;
async function sshConnect(
  host: any,
  command: string,
  connEnd: boolean,
  connectionName?: string
) {
  let output: any = [];
  const chunks: any = [];
  let outputCode: number = -1;
  let conn = new ssh2.Client();
  conn.connName = connectionName;
  connections.push(conn);
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
                for (let idx = 0; idx < connections.length; idx++) {
                  if (connections[idx].connName === connectionName) {
                    connections.splice(idx, 1);
                  }
                }
                outputCode = await code;
                if (connEnd) {
                  if ((await code) === 0) {
                    console.log(
                      "Connection End: Last Command Success => (code: " +
                        (await code) +
                        ", signal: " +
                        (await signal) +
                        ")"
                    );
                    // conn.end();
                  } else if ((await code) > 0) {
                    output.push(
                      `\nConnection End: Last Command Failed => (code: ${await code}, signal: ${await signal})`
                    );
                    console.log(
                      "Connection End: Last Command Failed => (code: " +
                        (await code) +
                        ", signal: " +
                        (await signal) +
                        ")"
                    );
                    // conn.end();
                  } else {
                    output.push(
                      `\nConnection End: Build Stopped By User => (code: ${await code}, signal: ${await signal})`
                    );
                    console.log(
                      "Connection End: Build Stopped By User => (code: " +
                        (await code) +
                        ", signal: " +
                        (await signal) +
                        ")"
                    );
                    // conn.end();
                  }
                } else {
                  if ((await code) === 0) {
                    console.log(
                      "Connection End: Last Command Success => (code: " +
                        (await code) +
                        ", signal: " +
                        (await signal) +
                        ")"
                    );
                    // conn.end();
                  } else if ((await code) > 0) {
                    output.push(
                      `\nConnection End: Last Command Failed => (code: ${await code}, signal: ${await signal})`
                    );
                    console.log(
                      "Connection End: Last Command Failed => (code: " +
                        (await code) +
                        ", signal: " +
                        (await signal) +
                        ")"
                    );
                    // conn.end();
                  } else {
                    output.push(
                      `\nConnection End: Build Stopped By User => (code: ${await code}, signal: ${await signal})`
                    );
                    console.log(
                      "Connection End: Build Stopped By User => (code: " +
                        (await code) +
                        ", signal: " +
                        (await signal) +
                        ")"
                    );
                    // conn.end();
                  }
                }
                resolve();
              })
              .on("data", (data: any) => {
                chunks.push(data);
              });
            stream
              .on("end", () => {
                output.push(Buffer.concat(chunks).toString());
              })
              .stderr.on("data", async (data: any) => {
                chunks.push(data);
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
  return resData;
}

/////////////////////////////////////////////////////////////////////

//GET Build Queue
app.get("/cicds/build-queue", async (req, res) => {
  try {
    res.send(buildQueue);
  } catch (e) {
    res.status(500);
  }
});

//GET Current Build Item
app.get("/cicds/current-build-item", async (req, res) => {
  try {
    res.send(currentbuildItems);
  } catch (e) {
    res.status(500);
  }
});

//GET cancel Current Build Item
app.post("/cicds/cancel-current-build-item", async (req: any, res) => {
  try {
    let body = JSON.parse(JSON.stringify(req.body.data));
    let connectionName = `${body.buildNumber}-${body.itemName}`;
    for (const connection of connections) {
      if (connection.connName === connectionName) {
        let cicd = await cicdModel.cicdData.findOne({ _id: body._id });
        let host = await hostModel.hostData.findOne({
          hostName: body.remoteHost,
        });
        await hostModel.hostData.findOneAndUpdate(
          { _id: host._id },
          {
            $pull: { buildItems: { cicdId: body._id } },
            $inc: { executors: (await cicd.cicdStages.length) - 1 },
          }
        );
        connection.end();
      }
    }
    res.send(`Build Removed => ${connectionName}`);
  } catch (e: any) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

// POST Connect SSH
app.post("/cicds/remove-build-from-queue", async (req: any, res) => {
  try {
    let body = JSON.parse(JSON.stringify(req.body.data));
    if (!buildQueue.isEmpty()) {
      for (let id = 0; id < buildQueue.items.length; id++) {
        if (body._id === buildQueue.items[id]._id) {
          buildQueue.items.splice(id, 1)
          res.send(buildQueue);
        } else {
          res.send("No Item Found In Queue To Remove...");
        }
      }
    } else {
      res.send("No Item In Queue To Remove...");
    }
  } catch (e: any) {
    console.log(e);
    res.status(500);
    res.send({ message: e.message });
  }
});

// POST Connect SSH
app.post("/connect/ssh", async (req: any, res) => {
  try {
    let body = JSON.parse(JSON.stringify(req.body.data));
    body.status = "queue";
    await cicdModel.cicdData.findOneAndUpdate({ _id: body._id }, body, {
      new: true,
      runValidator: true,
    });
    body.key = buildQueue.size() + 1;
    buildQueue.enqueue(body);
    res.send(buildQueue);
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
