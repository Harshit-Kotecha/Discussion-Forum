const app = require("express")();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const scoreFeedbackRoutes = require("./routes/scoreFeedback");
const judgesRoutes = require("./routes/judges");
const UserPerformance = require("./models/userPerformance");
const userRoutes = require("./routes/user");
const SpeakingUsers = require("../back-end/models/users_speaking");
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", scoreFeedbackRoutes);
app.use("/api/judges", judgesRoutes);
app.use("/api/user", userRoutes);

const http = require("http").Server(app);

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", function (socket) {
  console.log("socket connection successfull", socket);

  socket.on("mic-permission", async (data) => {
    console.log(data, " on socket mic-permission");

    const {
      allowedUsersToSpeak,
      channelName: channel_name,
      isNewConnection = false,
    } = data;
    console.log(
      isNewConnection,
      "  -------------------------------------------------------isNewConnection"
    );
    // Update the data in MongoDB
    let updatedDoc;

    if (isNewConnection) {
      updatedDoc = SpeakingUsers.findOne({ channel_name: channel_name });
    } else {
      updatedDoc = await SpeakingUsers.findOneAndUpdate(
        { channel_name: channel_name },
        { users_speaking: allowedUsersToSpeak },
        { new: true } // Return the updated document
      );

      if (!updatedDoc) {
        updatedDoc = new SpeakingUsers({
          channel_name: channel_name,
          users_speaking: allowedUsersToSpeak,
        });
        await updatedDoc.save();
      }
    }
    io.emit("mic-permission", {
      allowedUsersToSpeak: updatedDoc.users_speaking,
    }); // Emit with proper payload
  });

  socket.on("ask-judge-for-mic-permission", (data) => {
    io.emit("can-i-speak", data);
  });

  socket.on("user-timer", async (data) => {
    const { channelName, uid, time } = data;

    // immediately turn off all mics other than the user speaking
    await SpeakingUsers.findOneAndUpdate(
      { channel_name: channelName },
      { users_speaking: [uid] },
      { new: true } // Return the updated document
    );

    io.emit("mic-permission", {
      allowedUsersToSpeak: [uid],
    });

    setTimeout(async () => {
      // immediately turn off all mics
      await SpeakingUsers.findOneAndUpdate(
        { channel_name: channelName },
        { users_speaking: [] },
        { new: true } // Return the updated document
      );
      io.emit("mic-permission", {
        allowedUsersToSpeak: [],
      });
      io.emit("timer-end", {
        msg: "Time Up! The speakers mic is turned off automatically :)",
      });
    }, time * 1000 * 60);
  });

  socket.on("user-performance", async (data) => {
    const { channelName, email, score, relevance } = data;

    const user = await UserPerformance.findOne({
      email: email,
      channelName: channelName,
    });
    console.log(user, "curr user", relevance);
    if (!user) {
      const newDoc = new UserPerformance({
        channelName,
        email,
        score,
        relevance,
      });
      await newDoc.save();
    } else {
      user.score = score;
      user.relevance = relevance;
      console.log(user, " updated user");
      await user.save();
    }

    const users = await UserPerformance.find({ channelName });
    io.emit("all-users-performance", users);
  });

  socket.on("all-users-performance", async (channelName) => {
    const users = await UserPerformance.find({ channelName });

    io.emit("all-users-performance", users);
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

http.listen(3000, () => {
  console.log("listening on PORT:3000");
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));
