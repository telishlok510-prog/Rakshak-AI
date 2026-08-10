import type { SimulationConfig } from "./types";

/**
 * UPI Simulation — teaches the critical distinction between
 * "Collect Request" (takes money OUT) vs "Receive Money" (actually receiving)
 * 
 * This addresses the most common UPI scam pattern documented in lib/detection.ts
 */

export const UPI_SIMULATION: SimulationConfig = {
  id: "upi-safety",
  type: "upi",
  title: {
    en: "UPI Payment Safety",
    gu: "UPI પેમેન્ટ સલામતી",
  },
  description: {
    en: "Learn the difference between safe and risky UPI requests",
    gu: "સલામત અને જોખમી UPI વિનંતીઓ વચ્ચેનો ફરક શીખો",
  },
  startStepId: "send-money",
  steps: [
    {
      id: "send-money",
      screenType: "upi",
      title: {
        en: "Send Money to Friend",
        gu: "મિત્રને પૈસા મોકલો",
      },
      description: {
        en: "Your friend Priya asks you to send ₹200 for a birthday gift. You open your UPI app.",
        gu: "તમારી મિત્ર પ્રિયા જન્મદિવસની ભેટ માટે ₹200 મોકલવા કહે છે. તમે તમારી UPI એપ ખોલો છો.",
      },
      screenState: {
        screen: "send-money",
        recipientName: "Priya Kumar",
        recipientUPI: "priya@paytm",
        amount: "200",
        verified: true,
      },
      choices: [
        {
          label: {
            en: "Enter PIN and send ₹200",
            gu: "PIN દાખલ કરો અને ₹200 મોકલો",
          },
          isSafeChoice: true,
          nextStepId: "collect-request-fake-prize",
          feedback: {
            en: "✅ Correct! When YOU send money to someone you know, entering your PIN is normal and safe. Money goes OUT of your account to them.",
            gu: "✅ સાચું! જ્યારે તમે કોઈ જાણીતી વ્યક્તિને પૈસા મોકલો છો, તમારો PIN દાખલ કરવો સામાન્ય અને સલામત છે. પૈસા તમારા ખાતામાંથી બહાર તેમને જાય છે.",
          },
        },
      ],
    },
    {
      id: "collect-request-fake-prize",
      screenType: "upi",
      title: {
        en: "⚠️ Collect Request Received",
        gu: "⚠️ Collect વિનંતી મળી છે",
      },
      description: {
        en: "You receive a message: 'Congratulations! You won ₹5,000 prize. Approve this collect request from winner-prize@okaxis to receive your reward.'",
        gu: "તમને મેસેજ મળે છે: 'અભિનંદન! તમને ₹5,000 ના ઇનામ મળ્યા છે. તમારું ઇનામ મેળવવા winner-prize@okaxis ની આ collect વિનંતી મંજૂર કરો.'",
      },
      screenState: {
        screen: "collect-request",
        requestFrom: "winner-prize@okaxis",
        amount: "5000",
        message: "Congratulations! Prize money",
        requestType: "COLLECT",
      },
      choices: [
        {
          label: {
            en: "Reject the request — this is a scam",
            gu: "વિનંતી નકારો — આ છેતરપિંડી છે",
          },
          isSafeChoice: true,
          nextStepId: "qr-scan-scenario",
          feedback: {
            en: "🎯 Perfect! A COLLECT request always takes money OUT. You can never 'receive' money by approving a collect request. This is the #1 UPI scam. Real prizes never need collect requests!",
            gu: "🎯 સંપૂર્ણ! COLLECT વિનંતી હંમેશા પૈસા લઈ જાય છે. તમે collect વિનંતી મંજૂર કરીને પૈસા ક્યારેય 'મેળવી' શકતા નથી. આ નંબર 1 UPI છેતરપિંડી છે. સાચા ઇનામો માટે collect વિનંતીની જરૂર નથી!",
          },
        },
        {
          label: {
            en: "Approve to receive the ₹5,000 prize",
            gu: "₹5,000 ઇનામ મેળવવા માટે મંજૂર કરો",
          },
          isSafeChoice: false,
          nextStepId: "qr-scan-scenario",
          feedback: {
            en: "❌ Wrong! You just sent ₹5,000 to the scammer! A COLLECT request takes money FROM you — it never gives you money. To receive money on UPI, you never approve anything or enter your PIN. You just share your UPI ID.",
            gu: "❌ ખોટું! તમે હમણાં જ છેતરનારને ₹5,000 મોકલ્યા! COLLECT વિનંતી તમારી પાસેથી પૈસા લે છે — તે તમને ક્યારેય પૈસા આપતી નથી. UPI પર પૈસા મેળવવા માટે, તમે કંઈપણ મંજૂર નથી કરતા અથવા PIN દાખલ નથી કરતા. તમે ફક્ત તમારું UPI ID શેર કરો છો.",
          },
        },
      ],
      relatedIndicator: "UPI_COLLECT",
    },
    {
      id: "qr-scan-scenario",
      screenType: "upi",
      title: {
        en: "QR Code Payment",
        gu: "QR કોડ પેમેન્ટ",
      },
      description: {
        en: "You're selling your old phone on OLX for ₹8,000. The buyer says: 'I'll send payment now. Scan this QR code to RECEIVE the money.'",
        gu: "તમે OLX પર તમારો જૂનો ફોન ₹8,000 માં વેચી રહ્યા છો. ખરીદદાર કહે છે: 'હું હમણાં પેમેન્ટ મોકલું છું. પૈસા મેળવવા માટે આ QR કોડ સ્કેન કરો.'",
      },
      screenState: {
        screen: "qr-scan",
        qrCode: true,
        qrData: "upi://pay?pa=scammer@paytm&pn=Buyer&am=8000",
        scannedAmount: "8000",
        scannedName: "Buyer",
      },
      choices: [
        {
          label: {
            en: "Refuse to scan — QR codes send money, not receive",
            gu: "સ્કેન કરવાનો ઇનકાર કરો — QR કોડ પૈસા મોકલે છે, મેળવતા નથી",
          },
          isSafeChoice: true,
          nextStepId: "genuine-receive",
          feedback: {
            en: "🏆 Excellent! Scanning a QR code and entering your PIN SENDS money — it never receives it. To receive money, the buyer scans YOUR QR code, or sends to your UPI ID directly. This is a very common OLX/Quikr scam!",
            gu: "🏆 ઉત્તમ! QR કોડ સ્કેન કરવો અને PIN દાખલ કરવાથી પૈસા જાય છે — તે ક્યારેય મેળવતા નથી. પૈસા મેળવવા માટે, ખરીદદાર તમારો QR કોડ સ્કેન કરે છે, અથવા સીધા તમારા UPI ID પર મોકલે છે. આ ખૂબ સામાન્ય OLX/Quikr છેતરપિંડી છે!",
          },
        },
        {
          label: {
            en: "Scan the QR code and enter PIN to receive",
            gu: "મેળવવા માટે QR કોડ સ્કેન કરો અને PIN દાખલ કરો",
          },
          isSafeChoice: false,
          nextStepId: "genuine-receive",
          feedback: {
            en: "❌ Scammed! You just sent ₹8,000 to the scammer instead of receiving it! Remember: scanning QR = PAYING. To receive money, never scan anything or enter your PIN. Ask the buyer to scan your QR or send to your UPI ID.",
            gu: "❌ છેતરપિંડી થઈ! તમે મેળવવાને બદલે છેતરનારને ₹8,000 મોકલ્યા! યાદ રાખો: QR સ્કેન = ચૂકવણી. પૈસા મેળવવા માટે, કંઈપણ સ્કેન ન કરો કે PIN દાખલ ન કરો. ખરીદદારને તમારો QR સ્કેન કરવા કે તમારા UPI ID પર મોકલવા કહો.",
          },
        },
      ],
      relatedIndicator: "UPI_COLLECT",
    },
    {
      id: "genuine-receive",
      screenType: "upi",
      title: {
        en: "✅ Receiving Money (Correct Way)",
        gu: "✅ પૈસા મેળવવા (સાચી રીત)",
      },
      description: {
        en: "Your brother Raj sends you ₹1,000 for groceries. You see a notification: 'You received ₹1,000 from raj.kumar@upi'",
        gu: "તમારો ભાઈ રાજ તમને કિરાણા માટે ₹1,000 મોકલે છે. તમને નોટિફિકેશન દેખાય છે: 'તમને raj.kumar@upi ની પાસેથી ₹1,000 મળ્યા'",
      },
      screenState: {
        screen: "notification",
        message: "Payment received: ₹1,000 from raj.kumar@upi",
        balance: "+1000",
        pinRequired: false,
      },
      choices: [
        {
          label: {
            en: "Perfect! No PIN needed to receive money",
            gu: "સંપૂર્ણ! પૈસા મેળવવા માટે PIN જરૂરી નથી",
          },
          isSafeChoice: true,
          nextStepId: null,
          feedback: {
            en: "✅ Exactly right! When someone sends you money on UPI, it just appears in your account automatically. You NEVER need to: (1) Approve a request, (2) Enter your PIN, (3) Scan a QR code, (4) Click any link. If someone asks you to do any of these to 'receive money' — it's a scam!",
            gu: "✅ બરાબર! જ્યારે કોઈ તમને UPI પર પૈસા મોકલે છે, તે તમારા ખાતામાં આપોઆપ આવે છે. તમારે ક્યારેય જરૂર નથી: (1) વિનંતી મંજૂર કરવાની, (2) PIN દાખલ કરવાનો, (3) QR કોડ સ્કેન કરવાનો, (4) કોઈ લિંક ક્લિક કરવાની. જો કોઈ તમને 'પૈસા મેળવવા' માટે આમાંથી કંઈ કરવા કહે — તે છેતરપિંડી છે!",
          },
        },
      ],
    },
  ],
};
