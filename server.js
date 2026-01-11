
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// --- MONGODB SCHEMAS ---

const ChatRequestSchema = new mongoose.Schema({
  senderId: String,
  senderName: String,
  receiverId: String,
  reason: { type: String, enum: ['Internship', 'Skills', 'CGPA', 'Placement'] },
  message: { type: String, maxlength: 300 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
  participants: [String],
  participantNames: Map,
  lastMessage: String,
  updatedAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  chatId: mongoose.Schema.Types.ObjectId,
  senderId: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const ChatRequest = mongoose.model('ChatRequest', ChatRequestSchema);
const Chat = mongoose.model('Chat', ChatSchema);
const Message = mongoose.model('Message', MessageSchema);

// --- API ROUTES ---

// Submit a chat request
app.post('/api/chat/request', async (req, res) => {
  const { senderId, senderName, receiverId, reason, message } = req.body;
  
  // Weekly limit check (simplified)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const count = await ChatRequest.countDocuments({
    senderId,
    createdAt: { $gte: oneWeekAgo }
  });

  if (count >= 3) {
    return res.status(403).json({ message: "Weekly request limit (3) reached." });
  }

  const request = new ChatRequest({ senderId, senderName, receiverId, reason, message });
  await request.save();
  res.status(201).json(request);
});

// Get requests for a senior
app.get('/api/chat/requests/:userId', async (req, res) => {
  const requests = await ChatRequest.find({ receiverId: req.params.userId, status: 'pending' });
  res.json(requests);
});

// Accept/Reject request
app.put('/api/chat/request/:id', async (req, res) => {
  const { status, participantNames } = req.body;
  const request = await ChatRequest.findById(req.params.id);
  
  if (!request) return res.status(404).send();
  
  request.status = status;
  await request.save();

  if (status === 'accepted') {
    const newChat = new Chat({
      participants: [request.senderId, request.receiverId],
      participantNames: participantNames
    });
    await newChat.save();
    return res.json({ chat: newChat });
  }
  
  res.json({ message: "Request updated" });
});

// Get active chats for user
app.get('/api/chats/:userId', async (req, res) => {
  const chats = await Chat.find({ participants: req.params.userId }).sort({ updatedAt: -1 });
  res.json(chats);
});

// Get message history
app.get('/api/chat/:chatId/messages', async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId }).sort({ timestamp: 1 });
  res.json(messages);
});

// --- SOCKET.IO FLOW ---

io.on('connection', (socket) => {
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send_message', async (data) => {
    const { chatId, senderId, text } = data;
    const msg = new Message({ chatId, senderId, text });
    await msg.save();
    
    await Chat.findByIdAndUpdate(chatId, { lastMessage: text, updatedAt: Date.now() });
    
    io.to(chatId).emit('receive_message', {
      id: msg._id,
      chatId,
      senderId,
      text,
      timestamp: msg.timestamp
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
