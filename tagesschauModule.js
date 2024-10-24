//=========================================//
//============ START OF MODULE ============//
//=============== Version 1.1.1 =============//

let blCodes = {
    "BADEN-WÜRTTEMBERG": 1,
    "BAYERN": 2,
    "BERLIN": 3,
    "BRANDENBURG": 4,
    "BREMEN": 5,
    "HAMBURG": 6,
    "HESSEN": 7,
    "MECKLENBURG-VORPOMMERN": 8,
    "NIEDERSACHSEN": 9,
    "NORDRHEIN-WESTFHALEN": 10,
    "RHEINLAND-PFALZ": 11,
    "SAARLAND": 12,
    "SACHSEN": 13,
    "SACHSEN-ANHALT": 14,
    "SCHLESWIG-HOLSTEIN": 15,
    "THÜRINGEN": 16
};


//Get datas from tagesschau News-API
async function getFromAPI(feedtype, bundesland){
  let items;
  try {
      req = await new Request('https://www.tagesschau.de/api2u/news').loadJSON()
      res = req['news']
      if (feedtype == 'news'){
        items = res.filter(item => [0].includes(item.regionId))
    } else if (feedtype == 'regional'){
        items = res.filter(item => bundesland.includes(item.regionId))
    }
} catch(err){
    console.error(err.message)
    errorWidget = await createErrorWidget()
    if (config.runsInApp) await errorWidget.presentMedium()
    else if (config.runsInWidget) Script.setWidget(errorWidget)
    Script.complete()
  }
  //console.warn('feedtype: '  + feedtype + '\n')
  //console.log(items)
  return items
};


//Get datas from tagesschau Video-API
async function getVideosFromAPI(keyword){
    let videos;
    try {
        req = await new Request('https://www.tagesschau.de/api2u/channels').loadJSON()
        res = req['channels']
        if (keyword == null) videos = res
        else videos = res.find(element => element.title == keyword)
    } catch(err){
        console.error(err.message)
    }
    return videos
};


//Get datas from tagesschau Homepage-API
async function getFromHomepageAPI(bundesland){
    let arr = [];
    let sortArr;
    try {
      req = await new Request('https://www.tagesschau.de/api2u/homepage').loadJSON()
      res = req['regional']
      item = res.filter(item => bundesland.includes(item.regionId))
      arr = [req['news'][0], item[0]]
      sortArr = arr.sort((a, b) => new Date(arr[0].date) - new Date(arr[1].date))[0];
      //log(sortArr)
    } catch(err){
        console.error(err.message)
    }
    return sortArr
};


//Loads Images from given URL
async function loadImage(url){
    let img;
    try {
        img = await new Request(url).loadImage()
    } catch(error) {
        img = await getImageFor('Eilmeldung_NoThumbnailFound')
    }
  //return await new Request(url).loadImage()
    return img
};


//Saves Images from GitHub Repo
async function saveImages(){
 fm = FileManager.iCloud()
 dir = fm.joinPath(fm.documentsDirectory(), 'tagesschau-widget')
  let imgs = {
background:"https://www.tagesschau.de/infoscreen/img/background-16-9-HD.png",
header:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tagesschau_Logo_2015.svg/462px-Tagesschau_Logo_2015.svg.png",
appIcon:"https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/e4/53/54/e45354a1-b99f-8a00-2d1c-d260607c2ec0/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.png",
appIconRounded: "https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/Images/appIconRounded.png",
Eilmeldung_NoThumbnailFound:"https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/Images/Eilmeldung_NoThumbnailFound.png"}
  for (img in imgs) {
    imgName = img + ".png"
    imgPath = fm.joinPath(dir, imgName);
   if (!fm.fileExists(imgPath)) {
      req = new Request(imgs[img]);
      img = await req.loadImage();
      fm.writeImage(imgPath, img);
    }
  }
};


//Loads Images from iCloud Drive
async function getImageFor(name){
 fm = FileManager.iCloud()
 dir = fm.joinPath(fm.documentsDirectory(), 'tagesschau-widget')
  imgPath = fm.joinPath(dir, name + ".png")
  await fm.downloadFileFromiCloud(imgPath)
  img = await fm.readImage(imgPath)
 return img;
};


// Creates Article View of the Large Widget
async function createLargeArticleView(items, base, index){
 let df = new DateFormatter()
      df.dateFormat = 'dd.MM.yy, HH:mm'
      
  if (items[index] == undefined) index = Math.floor(Math.random()* index)

      base.addSpacer(2)
      
  let mainStack = base.addStack()
       mainStack.backgroundColor = new Color('#41414180')
       mainStack.cornerRadius = 7
       mainStack.spacing = 5
       mainStack.url = items[index].shareURL
      
  let imageStack = mainStack.addStack()
           
  let breakingNews = (items[index].breakingNews == true) ? '⚡️ ' : ''
  let img = (items[index].teaserImage == undefined) ? imageStack.addImage(await getImageFor("Eilmeldung_NoThumbnailFound")) : imageStack.addImage(await loadImage(items[index].teaserImage.imageVariants["16x9-1920"]))
       img.cornerRadius = 7
      
 let textStack = mainStack.addStack()
      textStack.layoutVertically()
      textStack. centerAlignContent()

       textStack.addSpacer(2)
      
  let headerArt = textStack.addStack()
       headerArt.spacing = 4
       headerArt.centerAlignContent()
      
  if (items[index].ressort == undefined) items[index].ressort = 'Sonstiges'
  
  let ressort = headerArt.addText(items[index].ressort.toUpperCase())
       ressort.textColor = Color.orange()
       ressort.font = Font.semiboldMonospacedSystemFont(8)
       ressort.lineLimit = 1
       ressort.minimumScaleFactor = 0.8
      
 let date = headerArt.addText(df.string(new Date(items[index].date))+" Uhr")
      date.font = Font.italicSystemFont(7)
      date.textOpacity = 0.7
      date.lineLimit = 1
      date.minimumScaleFactor = 0.8
      date.textColor = Color.white()
      
  let title = textStack.addText(breakingNews + items[index].title.replaceAll('+', '').trim())
       title.textColor = Color.white()
       title.font = Font.boldMonospacedSystemFont(10)
       title.minimumScaleFactor = 0.4
       title.lineLimit = 3

      mainStack.addSpacer()
      base.addSpacer(2)
};



//Creates Article View of Widget
async function createArticleView(items, base, index){
    let df = new DateFormatter()
         df.dateFormat = 'dd.MM.yy, HH:mm'

    if (items[index] == undefined) index = Math.floor(Math.random()* index)
    let breakingNews = (items[index].breakingNews == true) ? '⚡️ ' : ''

         base.addSpacer(2)

    let mainStack = base.addStack()
         mainStack.layoutVertically()
         mainStack.setPadding(3, 3, 3, 3)
         mainStack.backgroundColor = new Color('#41414180')
         mainStack.cornerRadius = 7
         mainStack.spacing = 2
         mainStack.url = items[index].shareURL
           
    if (items[index].ressort == undefined) items[index].ressort = 'Sonstiges'
  
    let ressort = mainStack.addText(items[index].ressort.toUpperCase())
         ressort.textColor = Color.orange()
         ressort.font = Font.semiboldMonospacedSystemFont(6)
         ressort.lineLimit = 1
         //ressort.minimumScaleFactor = 0.5

    let title = mainStack.addText(breakingNews + items[index].title.replaceAll('+', '').trim())
         title.textColor = Color.white()
         title.font = Font.boldMonospacedSystemFont(10)
         title.minimumScaleFactor = 0.5
         title.lineLimit = 4
         
         mainStack.addSpacer(2)

    let img = (items[index].teaserImage == undefined) ? mainStack.addImage(await getImageFor("Eilmeldung_NoThumbnailFound")) : mainStack.addImage(await loadImage(items[index].teaserImage.imageVariants["16x9-1920"]))
         img.cornerRadius = 7

   let date = mainStack.addText(df.string(new Date(items[index].date))+" Uhr")
        date.textColor = Color.white()
        date.font = Font.italicSystemFont(7)
        date.textOpacity = 0.7
        date.lineLimit = 1
        //date.minimumScaleFactor = 0.8

        mainStack.addSpacer()
};


async function getWebView(str){
    let wv = new WebView()
         wv.loadURL(str)
         wv.waitForLoad()
         wv.present(false)
};


//Create Notifications of Videos
function notificationSchedulerVid(video, nKey){
    let df = new DateFormatter()
        df.dateFormat = 'dd.MM.yy HH:mm'
    var nHeight = 220
    if (Device.isPad()) nHeight = 315
  let n = new Notification()
      n.title = video.title
      n.body = 'vom ' + df.string(new Date(video.date)) + ' Uhr'
      //n.addAction("Video im Browser Öffnen ▶︎", video.streams.h264xl, true)
      n.openURL = video.streams.h264xl
      n.identifier = video.externalId
      n.preferredContentHeight = nHeight
      n.deliveryDate = new Date(video.date)
      n.threadIdentifier = Script.name()
      n.scriptName = Script.name()
      n.userInfo = {"thumbnail":video.teaserImage.imageVariants["16x9-1920"]}
      n.schedule()
    
 nKey.set("current_podcast", video.tracking[0].pdt)
};


//Create Notifications
function notificationScheduler(item, ressort, nKey){
 let df = new DateFormatter()
     df.dateFormat = 'dd.MM.yy HH:mm'
 var nHeight = 211
 if (Device.isPad()) nHeight = 315
 let imgURLStr = (item.teaserImage == undefined) ? null : item.teaserImage.imageVariants["16x9-1920"]
 let n = new Notification()
     n.subtitle = item.title
     n.title = ressort.toUpperCase()+' | '+df.string(new Date(item.date)) + ' Uhr'
     n.body = `${item.content[0].value.replace(/<[^>]*>/g, '')}`
     n.addAction("Artikel Öffnen ↗", item.shareURL)
     n.identifier = item.sophoraId
     n.threadIdentifier = Script.name()
     n.preferredContentHeight = nHeight//211
     n.openURL = item.shareURL
     n.scriptName = Script.name()
     n.userInfo = {"thumbnail":imgURLStr}
     n.schedule()
    
 nKey.set("current_title_idx0", item.title)
};


//Get Code/Number of Bundesland
async function getBundeslandCode(bula){
    if (bula === ''){
        blCode = Object.values(blCodes)
    } else {
        keys = bula.split(',').map(key => key.trim())
        var blCode = keys.map(key => {
          const upperKey = key.toUpperCase()
          return blCodes[upperKey] || null
          })
     }
    log(blCode)
    return blCode
};


//Creates Error Widget
async function createErrorWidget(){
  let bgGradient = new LinearGradient()
      bgGradient.locations = [0, 1]
      bgGradient.colors = [new Color('#2D65AE'), new Color('#19274C')]
  let errorWidget = new ListWidget()
      errorWidget.backgroundGradient = bgGradient

  let title = errorWidget.addText('tagesschau')
      title.font = Font.headline()
      title.centerAlignText()

      errorWidget.addSpacer(10)

  let errTxt = errorWidget.addText('Es besteht keine Verbindung zum Internet')
      errTxt.font = Font.semiboldMonospacedSystemFont(16)
      errTxt.textColor = Color.red()

  let errTxt2 = errorWidget.addText('Dieses Widget benötigt eine Verbindung zum Internet um funktionieren zu können!')
      errTxt2.font = Font.regularRoundedSystemFont(14)
      errTxt2.textColor = Color.red()
      errTxt2.textOpacity = 0.8

  return errorWidget
};


//Checks if's there an server update on GitHub available
async function updateCheck(fm, modulePath, version) {
   url = 'https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/'
   endpoints = ['tagesschau-widget.js', 'tagesschauModule.js']
  let uC;
    try {
      updateCheck = new Request(url+endpoints[0]+'on')
      uC = await updateCheck.loadJSON()
    } catch (e){
        return log(e)
    }

  needUpdate = false
  if (uC.version > version){
      needUpdate = true
    if (config.runsInApp){
      //console.error(`New Server Version ${uC.version} Available`)
          newAlert = new Alert()
          newAlert.title = `Neue Server Version ${uC.version} Verfügbar!`
          newAlert.addAction("OK")
          newAlert.addDestructiveAction("Später")
          newAlert.message="Änderungen:\n" + uC.notes + "\n\nOK klicken für den Download von GitHub\n Mehr Infos zum Update siehe Github Repo"
      if (await newAlert.present() == 0){
        	reqCode = new Request(url+endpoints[0])
        	updatedCode = await reqCode.loadString()
        	pathCode = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`)
        	fm.writeString(pathCode, updatedCode)
        	reqModule = new Request(url+endpoints[1])
        	moduleFile = await reqModule.loadString()
        	fm.writeString(modulePath, moduleFile)
        	throw new Error("Update Komplett!")
      }
    }
  } else log("\n>> SCRIPT IST UP-TO-DATE!")
  
  return {uC, needUpdate}
};


//Exports Functions
module.exports = {
    getFromAPI,
    createLargeArticleView,
    createErrorWidget,
    updateCheck,
    saveImages,
    getImageFor,
    loadImage,
    notificationSchedulerVid,
    notificationScheduler,
    createArticleView,
    getBundeslandCode,
    getVideosFromAPI,
    getWebView,
    getFromHomepageAPI
};



//=========================================//
//============= END OF MODULE =============//
//=========================================//
