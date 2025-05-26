// for cheatting
import { Conversation } from "../models/conversation.model.js"
import { Message } from "../models/message.model.js";
export const sendMessage = async (req, res) => {
   try {
      const senderId = req.id;
      const receiverId = req.params.id;
      const { message } = req.body;
      let conversation = await Conversation.findOne({
         participants: { $all: [senderId, receiverId] }
      });
      // if not start conversation -- stablish
      if (!conversation) {
         conversation = await Conversation.create({
            participants: { $all: [senderId, receiverId] }
         })
      }
      const newMessage = await Message.create({
         senderId,
         receiverId,
         message,
      })

      if (newMessage) {
         conversation.messages.push(newMessage._id);
      }
      await Promise.all([conversation.save(), newMessage.save()]);

      // implement soket io for real time data transfer 


      return res.status(200).json({
         newMessage,
         success: true,
      })


   } catch (error) {
      console.log(error)
   }
}

export const getMessage = async (req, res) => {
   try {
      const senderId = req.id;
      const receiverId = req.params.id;
      const conversation = await Conversation.find({
         participants: { $all: [senderId, receiverId] }
      })

      if (!conversation) {
         return res.status(200).json({
            success: true,
            message: [],
         })
      }

      return res.status(200).json({
         success: true,
         message: conversation?.message,
      })


   } catch (error) {
      console.log(error);


   }
}