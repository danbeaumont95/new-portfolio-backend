const sgMail = require('@sendgrid/mail')
const User = require('../models/User');

exports.postEmailToDan = async (req, res) => {
    const { subject, text, senderEmail } = req.body;
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
          to: 'danielbeaumont95@hotmail.co.uk', // Change to your recipient
          from: 'danibeamo@hotmail.com', // Change to your verified sender
          subject: subject,
        //   text: text,
          html: `${text}<br></br><strong>Sender: ${senderEmail}</strong>`,
        }
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
          .catch((error) => {
            console.error(error)
          })  
          return res.status(200).json({'Msg': 'Email sent'})
    } catch (error) {
        console.log(error, 'err')
        return res.send(error)
    }

    
};

exports.postEmailToAllOnMailingList = async (req, res) => {
  const { subject, text } = req.body;
  try {
    const users = await (await User.find({onMailingList: true})).map((e) => e.email);
    console.log(users, 'users')
    if (!users) return res.status(401).json({msg: 'No users found on mailing list'});
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
          to: users, // Change to your recipient
          from: 'danibeamo@hotmail.com', // Change to your verified sender
          subject: subject,
        //   text: text,
          // html: `${text}<br></br><strong>Sender: ${senderEmail}</strong>`,
          html: text,
        }
        console.log(msg.to, 'msg to')
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
          .catch((error) => {
            console.error(error)
          })  
          return res.status(200).json({'Msg': 'Email sent to all on mailing list'})
    
  } catch (error) {
    console.log(error, 'error');
    res.send(error);
  }
}