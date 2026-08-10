import type { SimulationConfig } from "./types";

/**
 * Internet Banking Simulation — teaches safe online banking procedures
 * Covers: avoiding phishing links, verifying beneficiaries, confirming transfers
 */

export const NETBANKING_SIMULATION: SimulationConfig = {
  id: "netbanking-safety",
  type: "netbanking",
  title: {
    en: "Internet Banking Safety",
    gu: "ઇન્ટરનેટ બેંકિંગ સલામતી",
  },
  description: {
    en: "Practice safe online banking procedures",
    gu: "સલામત ઓનલાઇન બેંકિંગ પ્રક્રિયાઓની પ્રેક્ટિસ કરો",
  },
  startStepId: "login-link",
  steps: [
    {
      id: "login-link",
      screenType: "netbanking",
      title: {
        en: "Login to Internet Banking",
        gu: "ઇન્ટરનેટ બેંકિંગમાં લોગિન કરો",
      },
      description: {
        en: "You receive an SMS: 'Your account needs KYC update. Login now: http://sbi-netbanking.xyz/login'. What should you do?",
        gu: "તમને SMS મળે છે: 'તમારા ખાતાને KYC અપડેટની જરૂર છે. હમણાં લોગિન કરો: http://sbi-netbanking.xyz/login'. તમારે શું કરવું જોઈએ?",
      },
      screenState: {
        screen: "sms-notification",
        message: "Your account needs KYC update. Login: http://sbi-netbanking.xyz/login",
        linkPresent: true,
        domain: "sbi-netbanking.xyz",
      },
      choices: [
        {
          label: {
            en: "Ignore SMS, type bank URL directly in browser",
            gu: "SMS અવગણો, બ્રાઉઝરમાં સીધું બેંક URL ટાઇપ કરો",
          },
          isSafeChoice: true,
          nextStepId: "account-overview",
          feedback: {
            en: "🎯 Perfect! Never click banking links from SMS or email. Always type your bank's official URL directly. The link 'sbi-netbanking.xyz' is fake — real SBI is onlinesbi.sbi.co.in.",
            gu: "🎯 સંપૂર્ણ! SMS અથવા ઇમેઇલમાંથી બેંકિંગ લિંક પર ક્યારેય ક્લિક ન કરો. હંમેશા તમારી બેંકનું અધિકૃત URL સીધું ટાઇપ કરો. 'sbi-netbanking.xyz' લિંક નકલી છે — સાચું SBI onlinesbi.sbi.co.in છે.",
          },
        },
        {
          label: {
            en: "Click the link in SMS to login quickly",
            gu: "ઝડપથી લોગિન કરવા માટે SMS માં લિંક ક્લિક કરો",
          },
          isSafeChoice: false,
          nextStepId: "account-overview",
          feedback: {
            en: "❌ Dangerous! This is a phishing link (.xyz is not SBI's real domain). Clicking it takes you to a fake website that steals your password. Always type bank URLs yourself, never click links from messages.",
            gu: "❌ જોખમી! આ ફિશિંગ લિંક છે (.xyz SBI નું સાચું ડોમેન નથી). તેના પર ક્લિક કરવાથી તમે નકલી વેબસાઇટ પર જાઓ છો જે તમારો પાસવર્ડ ચોરી કરે છે. હંમેશા બેંક URL તમે જાતે ટાઇપ કરો, મેસેજમાંથી લિંક પર ક્યારેય ક્લિક ન કરો.",
          },
        },
      ],
      relatedIndicator: "FAKE_DOMAIN",
    },
    {
      id: "account-overview",
      screenType: "netbanking",
      title: {
        en: "Account Dashboard",
        gu: "ખાતા ડેશબોર્ડ",
      },
      description: {
        en: "You've logged in safely to your real bank website. You see your account balance and transaction history.",
        gu: "તમે તમારી સાચી બેંક વેબસાઇટ પર સલામત રીતે લોગિન થયા છો. તમે તમારા ખાતાનું બેલેન્સ અને ટ્રાન્ઝેક્શન હિસ્ટ્રી જુઓ છો.",
      },
      screenState: {
        screen: "dashboard",
        accountNumber: "XX1234",
        balance: "₹45,280",
        lastLogin: "Today 10:30 AM",
      },
      choices: [
        {
          label: {
            en: "Proceed to add a new beneficiary",
            gu: "નવો લાભાર્થી ઉમેરવા માટે આગળ વધો",
          },
          isSafeChoice: true,
          nextStepId: "add-beneficiary",
          feedback: {
            en: "Good. Proceeding to beneficiary management...",
            gu: "સારું. લાભાર્થી વ્યવસ્થાપન તરફ આગળ વધી રહ્યા છીએ...",
          },
        },
      ],
    },
    {
      id: "add-beneficiary",
      screenType: "netbanking",
      title: {
        en: "Add New Beneficiary",
        gu: "નવો લાભાર્થી ઉમેરો",
      },
      description: {
        en: "You want to add your friend's account to send money regularly. You receive account details via WhatsApp: 'Name: Rajesh Kumar, Account: 1234567890, IFSC: HDFC0001234'. What should you do?",
        gu: "તમે નિયમિત પૈસા મોકલવા માટે તમારા મિત્રનું ખાતું ઉમેરવા માંગો છો. તમને WhatsApp દ્વારા ખાતાની વિગતો મળે છે: 'નામ: રાજેશ કુમાર, ખાતું: 1234567890, IFSC: HDFC0001234'. તમારે શું કરવું જોઈએ?",
      },
      screenState: {
        screen: "add-beneficiary-form",
        fields: {
          name: "Rajesh Kumar",
          accountNumber: "1234567890",
          ifsc: "HDFC0001234",
        },
      },
      choices: [
        {
          label: {
            en: "Verify details with friend via call before adding",
            gu: "ઉમેરતા પહેલા કૉલ દ્વારા મિત્ર સાથે વિગતો ચકાસો",
          },
          isSafeChoice: true,
          nextStepId: "transfer-money",
          feedback: {
            en: "✅ Excellent! Always verify bank details by calling the person directly. WhatsApp accounts can be hacked. One wrong digit sends money to a stranger forever.",
            gu: "✅ ઉત્તમ! હંમેશા વ્યક્તિને સીધા ફોન કરીને બેંક વિગતો ચકાસો. WhatsApp ખાતાઓ હેક થઈ શકે છે. એક ખોટો અંક પૈસા કાયમ માટે અજાણ્યાને મોકલે છે.",
          },
        },
        {
          label: {
            en: "Add directly — it came from friend's WhatsApp",
            gu: "સીધું ઉમેરો — તે મિત્રના WhatsApp માંથી આવ્યું છે",
          },
          isSafeChoice: false,
          nextStepId: "transfer-money",
          feedback: {
            en: "⚠️ Risky! WhatsApp accounts can be hacked. A scammer might be sending you their account details pretending to be your friend. Always verify account details via a phone call, not just messages.",
            gu: "⚠️ જોખમી! WhatsApp ખાતાઓ હેક થઈ શકે છે. છેતરનાર તમારા મિત્ર હોવાનો ડોળ કરીને તેમના ખાતાની વિગતો મોકલી શકે છે. હંમેશા ફોન કૉલ દ્વારા ખાતાની વિગતો ચકાસો, માત્ર મેસેજ દ્વારા નહીં.",
          },
        },
      ],
    },
    {
      id: "transfer-money",
      screenType: "netbanking",
      title: {
        en: "Transfer Money",
        gu: "પૈસા ટ્રાન્સફર કરો",
      },
      description: {
        en: "You're ready to transfer ₹5,000 to pay your electricity bill. The beneficiary name shows as 'MSEDCL BILL PAYMENT'. Review the details before confirming.",
        gu: "તમે તમારા વીજળી બિલ ચૂકવવા ₹5,000 ટ્રાન્સફર કરવા તૈયાર છો. લાભાર્થીનું નામ 'MSEDCL BILL PAYMENT' તરીકે દેખાય છે. ખાતરી કરતા પહેલા વિગતો સમીક્ષા કરો.",
      },
      screenState: {
        screen: "confirm-transfer",
        beneficiary: "MSEDCL BILL PAYMENT",
        accountNumber: "9876543210",
        amount: "5000",
        purpose: "Electricity Bill",
      },
      choices: [
        {
          label: {
            en: "Review all details carefully, then confirm",
            gu: "બધી વિગતો કાળજીપૂર્વક સમીક્ષા કરો, પછી ખાતરી કરો",
          },
          isSafeChoice: true,
          nextStepId: "transaction-complete",
          feedback: {
            en: "✅ Perfect! Always review: (1) Beneficiary name, (2) Account number, (3) Amount. Once money leaves, it's almost impossible to get back. Take your time, verify everything.",
            gu: "✅ સંપૂર્ણ! હંમેશા સમીક્ષા કરો: (1) લાભાર્થીનું નામ, (2) ખાતા નંબર, (3) રકમ. પૈસા ગયા પછી, તે પાછા મેળવવા લગભગ અશક્ય છે. તમારો સમય લો, બધું ચકાસો.",
          },
        },
        {
          label: {
            en: "Click confirm quickly to save time",
            gu: "સમય બચાવવા માટે ઝડપથી ખાતરી ક્લિક કરો",
          },
          isSafeChoice: false,
          nextStepId: "transaction-complete",
          feedback: {
            en: "⚠️ Dangerous habit! Rushing leads to mistakes. Always take 10 seconds to verify beneficiary name and amount. One wrong click can't be undone.",
            gu: "⚠️ જોખમી આદત! ઉતાવળ ભૂલો તરફ દોરી જાય છે. લાભાર્થીનું નામ અને રકમ ચકાસવા માટે હંમેશા 10 સેકંડ લો. એક ખોટી ક્લિક પાછી ન થઈ શકે.",
          },
        },
      ],
    },
    {
      id: "transaction-complete",
      screenType: "netbanking",
      title: {
        en: "Transaction Successful",
        gu: "ટ્રાન્ઝેક્શન સફળ",
      },
      description: {
        en: "Your payment was successful! Transaction reference number: TXN123456789. What should you do next?",
        gu: "તમારી ચૂકવણી સફળ થઈ! ટ્રાન્ઝેક્શન સંદર્ભ નંબર: TXN123456789. તમારે આગળ શું કરવું જોઈએ?",
      },
      screenState: {
        screen: "success",
        message: "Transaction Successful",
        referenceNumber: "TXN123456789",
        amount: "₹5,000",
        beneficiary: "MSEDCL BILL PAYMENT",
        date: "Today 11:45 AM",
      },
      choices: [
        {
          label: {
            en: "Save/screenshot transaction details and logout",
            gu: "ટ્રાન્ઝેક્શન વિગતો સાચવો/સ્ક્રીનશોટ કરો અને લૉગઆઉટ કરો",
          },
          isSafeChoice: true,
          nextStepId: null,
          feedback: {
            en: "✅ Perfect! Always: (1) Save transaction reference number, (2) Logout completely when done, (3) Never leave banking sites open unattended. Keep records for disputes or verification.",
            gu: "✅ સંપૂર્ણ! હંમેશા: (1) ટ્રાન્ઝેક્શન સંદર્ભ નંબર સાચવો, (2) પૂર્ણ થયા પછી સંપૂર્ણપણે લૉગઆઉટ કરો, (3) બેંકિંગ સાઇટ્સ ખુલ્લી છોડો નહીં. વિવાદ અથવા ચકાસણી માટે રેકોર્ડ રાખો.",
          },
        },
        {
          label: {
            en: "Close browser tab — no need to logout",
            gu: "બ્રાઉઝર ટેબ બંધ કરો — લૉગઆઉટની જરૂર નથી",
          },
          isSafeChoice: false,
          nextStepId: null,
          feedback: {
            en: "⚠️ Not safe! Always logout properly from banking sites. Just closing the tab might leave your session active. Someone using your computer later could access your account. Always click 'Logout'.",
            gu: "⚠️ સલામત નથી! બેંકિંગ સાઇટ્સમાંથી હંમેશા યોગ્ય રીતે લૉગઆઉટ કરો. ફક્ત ટેબ બંધ કરવાથી તમારું સત્ર સક્રિય રહી શકે. પછી તમારા કમ્પ્યુટરનો ઉપયોગ કરનાર કોઈ તમારા ખાતામાં પ્રવેશ કરી શકે. હંમેશા 'લૉગઆઉટ' ક્લિક કરો.",
          },
        },
      ],
    },
  ],
};
