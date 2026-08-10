import type { SimulationConfig } from "./types";

/**
 * ATM Simulation — teaches safe ATM withdrawal procedures
 * Covers: PIN privacy, dealing with strangers, taking card and receipt
 */

export const ATM_SIMULATION: SimulationConfig = {
  id: "atm-safety",
  type: "atm",
  title: {
    en: "ATM Safety Practice",
    gu: "ATM સલામતી પ્રેક્ટિસ",
  },
  description: {
    en: "Learn safe ATM procedures step-by-step",
    gu: "પગલું દર પગલું સલામત ATM પ્રક્રિયાઓ શીખો",
  },
  startStepId: "insert-card",
  steps: [
    {
      id: "insert-card",
      screenType: "atm",
      title: {
        en: "Insert Your Card",
        gu: "તમારું કાર્ડ દાખલ કરો",
      },
      description: {
        en: "You have arrived at an SBI ATM. You are ready to insert your card.",
        gu: "તમે SBI ATM પર આવ્યા છો. તમે તમારું કાર્ડ દાખલ કરવા તૈયાર છો.",
      },
      screenState: {
        screen: "welcome",
        message: "WELCOME TO SBI ATM",
        cardSlot: true,
      },
      choices: [
        {
          label: {
            en: "Insert card and proceed",
            gu: "કાર્ડ દાખલ કરો અને આગળ વધો",
          },
          isSafeChoice: true,
          nextStepId: "enter-pin-privacy",
          feedback: {
            en: "Good! Always ensure you are at a genuine ATM (check for bank logos and proper maintenance).",
            gu: "સારું! હંમેશા ખાતરી કરો કે તમે સાચા ATM પર છો (બેંક લોગો અને યોગ્ય જાળવણી તપાસો).",
          },
        },
      ],
    },
    {
      id: "enter-pin-privacy",
      screenType: "atm",
      title: {
        en: "Enter Your PIN",
        gu: "તમારો PIN દાખલ કરો",
      },
      description: {
        en: "Someone is standing very close behind you while you enter your PIN. What should you do?",
        gu: "તમે PIN દાખલ કરતા હોવ ત્યારે કોઈ તમારી પાછળ ખૂબ જ નજીક ઊભું છે. તમારે શું કરવું જોઈએ?",
      },
      screenState: {
        screen: "pin-entry",
        message: "ENTER YOUR PIN",
        pinField: "****",
        stranger: true,
      },
      choices: [
        {
          label: {
            en: "Ask the person to step back and shield the PIN pad",
            gu: "વ્યક્તિને પાછળ જવા કહો અને PIN પેડ ઢાંકો",
          },
          isSafeChoice: true,
          nextStepId: "select-transaction",
          feedback: {
            en: "Excellent! Always shield your PIN and maintain your privacy. Never let anyone see your PIN.",
            gu: "ખૂબ સારું! હંમેશા તમારો PIN ઢાંકો અને તમારી ખાનગી જાળવો. કોઈને તમારો PIN જોવા ન દો.",
          },
        },
        {
          label: {
            en: "Continue entering PIN — they probably can't see",
            gu: "PIN દાખલ કરવાનું ચાલુ રાખો — તેઓ જોઈ શકતા નહીં હોય",
          },
          isSafeChoice: false,
          nextStepId: "select-transaction",
          feedback: {
            en: "⚠️ Risky! Shoulder surfing is a common tactic. Always ask strangers to maintain distance and shield your PIN with your hand.",
            gu: "⚠️ જોખમી! ખભા ઉપર જોવું એ સામાન્ય યુક્તિ છે. હંમેશા અજાણ્યાઓને અંતર રાખવા કહો અને તમારા હાથથી PIN ઢાંકો.",
          },
        },
      ],
    },
    {
      id: "select-transaction",
      screenType: "atm",
      title: {
        en: "Select Transaction",
        gu: "ટ્રાન્ઝેક્શન પસંદ કરો",
      },
      description: {
        en: "Your PIN was accepted. Choose what you want to do.",
        gu: "તમારો PIN સ્વીકારાઈ ગયો. તમે શું કરવા માંગો છો તે પસંદ કરો.",
      },
      screenState: {
        screen: "main-menu",
        options: ["WITHDRAWAL", "BALANCE INQUIRY", "MINI STATEMENT"],
      },
      choices: [
        {
          label: {
            en: "Select Withdrawal",
            gu: "નિકાસી પસંદ કરો",
          },
          isSafeChoice: true,
          nextStepId: "helper-approach",
          feedback: {
            en: "Proceeding with withdrawal...",
            gu: "નિકાસી સાથે આગળ વધી રહ્યા છીએ...",
          },
        },
      ],
    },
    {
      id: "helper-approach",
      screenType: "atm",
      title: {
        en: "Stranger Offers Help",
        gu: "અજાણ્યો વ્યક્તિ મદદ ઓફર કરે છે",
      },
      description: {
        en: "A friendly stranger approaches and says: 'Let me help you. Which amount do you want? I'll press the buttons for you.'",
        gu: "એક મિત્રતાપૂર્ણ અજાણ્યો વ્યક્તિ આવે છે અને કહે છે: 'હું મદદ કરું. તમને કેટલી રકમ જોઈએ છે? હું તમારા માટે બટન દબાવીશ.'",
      },
      screenState: {
        screen: "amount-entry",
        message: "SELECT OR ENTER AMOUNT",
        stranger: true,
        helping: true,
      },
      choices: [
        {
          label: {
            en: "Politely decline and do it yourself",
            gu: "નમ્રતાથી નકારો અને તમે જાતે કરો",
          },
          isSafeChoice: true,
          nextStepId: "complete-transaction",
          feedback: {
            en: "Perfect! Never let anyone operate the ATM for you. Even 'helpful' strangers might be trying to see your PIN or swap your card.",
            gu: "સંપૂર્ણ! ક્યારેય કોઈને તમારા માટે ATM ચલાવવા ન દો. 'મદદગાર' અજાણ્યા લોકો પણ તમારો PIN જોવા અથવા તમારું કાર્ડ બદલવાનો પ્રયાસ કરી શકે છે.",
          },
        },
        {
          label: {
            en: "Accept the help — seems friendly",
            gu: "મદદ સ્વીકારો — મૈત્રીપૂર્ણ લાગે છે",
          },
          isSafeChoice: false,
          nextStepId: "complete-transaction",
          feedback: {
            en: "⚠️ Dangerous! Never let strangers touch the ATM or see your screen. They could memorize your PIN, swap your card, or divert the cash. Always do it yourself.",
            gu: "⚠️ જોખમી! ક્યારેય અજાણ્યાઓને ATM સ્પર્શ કરવા કે તમારી સ્ક્રીન જોવા ન દો. તેઓ તમારો PIN યાદ કરી શકે, કાર્ડ બદલી શકે, અથવા રોકડ વાળી શકે. હંમેશા તમે જાતે કરો.",
          },
        },
      ],
    },
    {
      id: "complete-transaction",
      screenType: "atm",
      title: {
        en: "Complete Transaction",
        gu: "ટ્રાન્ઝેક્શન પૂર્ણ કરો",
      },
      description: {
        en: "Transaction successful! Cash is dispensed. Receipt is being printed. What do you do next?",
        gu: "ટ્રાન્ઝેક્શન સફળ! રોકડ આપવામાં આવી છે. રસીદ પ્રિન્ટ થઈ રહી છે. તમે આગળ શું કરો છો?",
      },
      screenState: {
        screen: "complete",
        message: "PLEASE TAKE YOUR CASH",
        cash: true,
        receipt: true,
        card: true,
      },
      choices: [
        {
          label: {
            en: "Take cash, card, and receipt before leaving",
            gu: "જતા પહેલા રોકડ, કાર્ડ અને રસીદ લો",
          },
          isSafeChoice: true,
          nextStepId: null,
          feedback: {
            en: "✅ Perfect! Always take: (1) Your card, (2) Your cash, (3) Your receipt. Never leave anything behind. Keep your receipt to track transactions.",
            gu: "✅ સંપૂર્ણ! હંમેશા લો: (1) તમારું કાર્ડ, (2) તમારી રોકડ, (3) તમારી રસીદ. કંઈપણ પાછળ ન છોડો. ટ્રાન્ઝેક્શન ટ્રેક કરવા તમારી રસીદ રાખો.",
          },
        },
        {
          label: {
            en: "Take cash and leave quickly (skip receipt)",
            gu: "રોકડ લો અને ઝડપથી નીકળો (રસીદ છોડો)",
          },
          isSafeChoice: false,
          nextStepId: null,
          feedback: {
            en: "⚠️ Not ideal. Always take your receipt to verify the transaction later. Also, never forget your card in the ATM!",
            gu: "⚠️ આદર્શ નથી. બાદમાં ટ્રાન્ઝેક્શન ચકાસવા માટે હંમેશા તમારી રસીદ લો. અને, ATM માં તમારું કાર્ડ ક્યારેય ભૂલશો નહીં!",
          },
        },
      ],
    },
  ],
};
