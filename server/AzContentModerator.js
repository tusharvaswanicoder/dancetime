// POST https://dancetime-content-moderator.cognitiveservices.azure.com/contentmoderator/moderate/v1.0/ProcessText/Screen?classify=True
// with HEADER: Ocp-Apim-Subscription-Key = key, Content-Type: text/plain
// body as just the text to query
// https://westus.dev.cognitive.microsoft.com/docs/services/57cf753a3f9b070c105bd2c1/operations/57cf753a3f9b070868a1f66f/console 

// returns: 
/*

{
  "OriginalText": "Dua Lipa Cool Dance poop",
  "NormalizedText": "Dua Lipa Cool Dance poop",
  "Misrepresentation": null,
  "Classification": {
    "ReviewRecommended": true,
    "Category1": {
      "Score": 0.0014738067984580994
    },
    "Category2": {
      "Score": 0.28088998794555664
    },
    "Category3": {
      "Score": 0.9879999756813049
    }
  },
  "Language": "eng",
  "Terms": null,
  "Status": {
    "Code": 3000,
    "Description": "OK",
    "Exception": null
  },
  "TrackingId": "21758ce9-808d-4dac-9c98-b3604843ae36"
}

{
  "OriginalText": "Dance Like Crazy",
  "NormalizedText": "Dance Like Crazy",
  "Misrepresentation": null,
  "Classification": {
    "ReviewRecommended": false,
    "Category1": {
      "Score": 0.016509119421243668
    },
    "Category2": {
      "Score": 0.2296631783246994
    },
    "Category3": {
      "Score": 0.17165660858154297
    }
  },
  "Language": "eng",
  "Terms": null,
  "Status": {
    "Code": 3000,
    "Description": "OK",
    "Exception": null
  },
  "TrackingId": "47bcc1ac-00b7-417b-9ae3-303877036164"
}

*/