import whatsappWeb from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import {
  getAvailableHoursViernes, getAvailableHoursLunes, removeHourFromLunes, removeHourFromViernes
} from './availableHours.js';
const { Client, LocalAuth } = whatsappWeb;


const serverStartDate = new Date()

const client = new Client({
  webVersionCache:
  {
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2409.0.html',
    type: 'remote'
  },
  authStrategy: new LocalAuth()
});

const evaluateCancelPattern = (message) => {
  const message_lower = message.toLowerCase()
  const regex = /cancelo turno|canceló turno|csncelo turno|dejo libre el turno|dejo libre turno|cancelo un turno|cancelo el turno/i;
  return regex.test(message_lower);
}

const evaluateHoursPattern = (message) => {
  const regex = /\b(\d{1,2})(?::(\d{2}))?\b/g
  let hoursFind = []
  let match

  while ((match = regex.exec(message.toLowerCase())) !== null) {
    let hour = match[1]
    hoursFind.push(`${hour}:00`)
  }

  return hoursFind;
}

const defineRangeDate = () => {
  const actualDate = new Date();
  const currentDayWeek = actualDate.getDay();

  let startRange, endRange;

  // Jueves
  if (currentDayWeek === 4 && actualDate.getHours() >= 21) {

    startRange = new Date(actualDate);
    startRange.setHours(21, 0, 0, 0);

    endRange = new Date(actualDate);
    endRange.setDate(actualDate.getDate() + 1);
    endRange.setHours(18, 0, 0, 0);


    // Domingo
  } else if (currentDayWeek === 0 && actualDate.getHours() >= 21) {
    startRange = new Date(actualDate);
    startRange.setHours(21, 0, 0, 0);

    endRange = new Date(actualDate);
    endRange.setDate(actualDate.getDate() + 1);
    endRange.setHours(18, 0, 0, 0);

    // Viernes
  } else if (currentDayWeek === 5 && actualDate.getHours() < 18) {
    startRange = new Date(actualDate);
    startRange.setDate(actualDate.getDate() - 1);
    startRange.setHours(21, 0, 0, 0);

    endRange = new Date(actualDate);
    endRange.setHours(18, 0, 0, 0);
    // Lunes
  } else if (currentDayWeek === 1 && actualDate.getHours() < 18) {
    startRange = new Date(actualDate);
    startRange.setDate(actualDate.getDate() - 1);
    startRange.setHours(21, 0, 0, 0);

    endRange = new Date(actualDate);
    endRange.setHours(18, 0, 0, 0);
  } else {

    return false;
  }

  return { startRange: startRange, endRange: endRange };
}

const isInRange = () => {
  const range = defineRangeDate();
  if (!range) return false;

  const { startRange: startRange, endRange: endRange } = range;
  const currentDate = new Date();

  return currentDate >= startRange && currentDate <= endRange;
}


client.on('loading_screen', (percent, message) => {
  console.log('Cargando: ', percent, message);
});

client.on('qr', (qr) => {
  console.log("Generación de QR de Vinculación de WhatsApp 📲")
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('Autenticación Completada 🕵️')
});

client.on('auth_failure', msg => {
  console.error('Falla de Autenticación ⚠ \nError:', msg);
});


client.on('ready', () => {
  console.log('WhatsApp Bot Conectado ✅');
});


client.on('message', msg => {
  const dateMsg = new Date(msg.timestamp * 1000)

  let sentReply = false

  const hourMsg = evaluateHoursPattern(msg.body)[0] ?? ''

  if (msg.from === '' && evaluateCancelPattern(msg.body) && (dateMsg > serverStartDate) && isInRange()) {
    const currentDay = new Date().getDay()

    // Jueves-Viernes
    if (currentDay === 4 || currentDay === 5) {
      const availableHours = getAvailableHoursViernes()

      sentReply = availableHours.some((hour) => {
        return hour === hourMsg
      })

      if (sentReply) {
        removeHourFromViernes(hourMsg)
      }

    }

    // Domingo-Lunes
    if (currentDay === 0 || currentDay === 1) {
      const availableHours = getAvailableHoursLunes()

      sentReply = availableHours.some((hour) => {
        return hour === hourMsg
      })

      if (sentReply) {
        removeHourFromLunes(hourMsg)
      }
    }

    if (sentReply) {
      msg.reply('Yo')
    }
  }

});


client.initialize();

// client.on("message_create", msg => {
//
//   const dateMsg = new Date(msg.timestamp * 1000)
//
//   let sentReply = false
//
//   const hourMsg = evaluateHoursPattern(msg.body)[0] ?? ''
//
//   if (msg.to === '120363299878432741@g.us' && evaluateCancelPattern(msg.body) && (dateMsg > serverStartDate) && isInRange()) {
//     const currentDay = new Date().getDay()
//
//     if (currentDay === 4 || currentDay === 5) {
//       const availableHours = getAvailableHoursViernes()
//
//       sentReply = availableHours.some((hour) => {
//         return hour === hourMsg
//       })
//
//       if (sentReply) {
//         removeHourFromViernes(hourMsg)
//       }
//
//     }
//
//     if (currentDay === 0 || currentDay === 1) {
//       const availableHours = getAvailableHoursLunes()
//
//       sentReply = availableHours.some((hour) => {
//         return hour === hourMsg
//       })
//
//       if (sentReply) {
//         removeHourFromLunes(hourMsg)
//       }
//     }
//
//     if (sentReply) {
//       msg.reply('Yo')
//     }
//   }
//
// })
//
//
