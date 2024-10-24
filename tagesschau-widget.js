// created by iamrbn → https://github.com/iamrbn/tagesschau-widget
// Inspitiert durch u/trbn_hck (mehr dazu in der GitHub Repo)

//==============================================
//!!!!!!!!!!! START OF CONFIG ZONE !!!!!!!!!!!!!

let feedtype = 'regional' //Standard Feed Typ eingeben 'news' oder 'regional' möglich!
let bundesland = 'baden-württemberg'//'baden-württemberg' // für alle BL bitte leere hochkommatas ('') verwenden; für mehrere BL diese bitte mit komma getrennt aneinander reihen!

//Refresh Intervall der Widgets/Scripts in Minuten eingeben
var CONFIGS = {
      DEVICES: {
       iPad: {
        enableNotifications: true, //true: Neue Pushnachrichten erlauben; ansonsten 'false'
        tagesschau100sec: true, //true: für Pushnachrichten bei neuer Folge
        refreshInt: 60
       },
       iPhone: {
        enableNotifications: true,
        tagesschau100sec: true,
        refreshInt: 60
       }
     }
};

//!!!!!!!!!!!! END OF CONFIG ZONE !!!!!!!!!!!!!!!
//===============================================
//Änderungen ab hier auf eigene Gefahr!!!

let nKey = Keychain
let wParameter = await args.widgetParameter
let nParameter = await args.notification
let nParameter2 = await args.notification
let widgetSize = config.widgetFamily
let fm = FileManager.iCloud()
let dir = fm.joinPath(fm.documentsDirectory(), 'tagesschau-widget')
if (!fm.fileExists(dir)) fm.createDirectory(dir)
let modulePath = fm.joinPath(dir, 'tagesschauModule.js')
if (!fm.fileExists(modulePath)) await loadModule()
if (!fm.isFileDownloaded(modulePath)) await fm.downloadFileFromiCloud(modulePath)
let tModule = importModule(modulePath)
let uCheck = await tModule.updateCheck(fm, modulePath, 1.51)
await tModule.saveImages()
let df = new DateFormatter()
    df.dateFormat = 'dd.MM.yy, HH:mm'

let bulaCode = await tModule.getBundeslandCode(bundesland)

if (wParameter == null) wParameter = feedtype
else if (wParameter.toLowerCase().includes("regional")) feedtype = "regional"
else if (wParameter.toLowerCase().includes("news")) feedtype = "news"

if (CONFIGS.DEVICES[Device.model()].tagesschau100sec) video = await tModule.getVideosFromAPI('tagesschau in 100 Sekunden')
var notificationArticle = await tModule.getFromHomepageAPI(bulaCode)
var items = await tModule.getFromAPI(feedtype, bulaCode)
var shareURL = items[0].shareURL
var breakingNews = (items[0].breakingNews === true) ? '⚡️ ' : ''
var ressort = (items[0].ressort == undefined) ? 'Sonstiges' : items[0].ressort

if (!nKey.contains("current_title_idx0")) nKey.set("current_title_idx0", notificationArticle.title)
if (!nKey.contains("current_podcast")) nKey.set("current_podcast", video.tracking[0].pdt)
//if (nKey.get("current_title_idx0") != items[0].title && enableNotifications) notificationScheduler()
if (CONFIGS.DEVICES[Device.model()].enableNotifications){
  if (nKey.get("current_title_idx0") != notificationArticle.title) await tModule.notificationScheduler(notificationArticle, ressort, nKey)
}
if (CONFIGS.DEVICES[Device.model()].tagesschau100sec){
  if (nKey.get("current_podcast") != video.tracking[0].pdt) await tModule.notificationSchedulerVid(video, nKey)
}

if (config.runsInApp){
    //w = await createLargeWidget()
    //w.presentLarge()
    QuickLook.present(await createTable())
} else if (config.runsInWidget || config.runsInAccessoryWidget){
  switch (widgetSize){
    case "small": w = await createSmallWidget()
      break
    
    case "medium": w = await createMediumWidget(false)
        if(wParameter.toLowerCase().includes("detailview")) w = await createMediumDetailWidget()
        else widget = await createMediumWidget()
      break
    
    case "large": w = await createLargeWidget(false)
        if(wParameter.toLowerCase().includes("detailview")) w = await createLargeDetailWidget()
        else widget = await createLargeWidget()
      break
    
    case "extraLarge": w = await createExtraLargeWidget()
        if(wParameter.toLowerCase().includes("detailview")) w = await createExtralargeDetailWidget()
        else w = await createExtraLargeWidget()
      break
    
    case "accessoryCircular": w = await createSmallLSW()
      break
    
    case "accessoryRectangular": w = await createMediumLSW()
      break
    
    default: w = await createMediumWidget()
    }
  Script.setWidget(w)
} else if (config.runsInNotification){
    attatchmend = (nParameter.userInfo.thumbnail === null) ? await tModule.getImageFor("Eilmeldung_NoThumbnailFound") : nParameter.userInfo.thumbnail
    QuickLook.present(attatchmend)
    //await tModule.getWebView(nParameter.userInfo.video)
};


//--------- CREATE SMALL LOCKSCREENWIDGET ---------
async function createSmallLSW(){
  let w = new ListWidget()
  let img = w.addImage(await tModule.tModule.getImageFor('appIconRounded'))
      img.imageSize = new Size(55, 55)
      img.centerAlignImage()
  
  return w
};


//--------- CREATE MEDIUM LOCKSCREENWIDGET ---------
async function createMediumLSW(){
    let w = new ListWidget()
        //w.addAccessoryWidgetBackground = true
        w.setPadding(0, 0, 0, 0)
        w.url = shareURL
        w.refreshAfterDate = new Date(Date.now() + 1000*60* CONFIGS.DEVICES[Device.model()].refreshInt)

    let headerStack = w.addStack()
        headerStack.spacing = 3
        headerStack.centerAlignContent()
    
    let sf = SFSymbol.named("globe.europe.africa.fill")
        sf.applyUltraLightWeight()
    let headerImg = headerStack.addImage(sf.image)
        headerImg.imageSize = new Size(10, 10)
        headerImg.tintColor = Color.white()
    let headerTxt = headerStack.addText("tagesschau " + feedType.charAt(0).toUpperCase() + feedType.slice(1))
        headerTxt.font = Font.boldSystemFont(9)
    
        w.addSpacer(0.5)
    
    let artTitle = w.addText(breakingNews + items[0].title.replaceAll('+', '').trim())
        artTitle.font = Font.semiboldSystemFont(9)
        artTitle.minimumScaleFactor = 0.6
        artTitle.lineLimit = 2
    
    let artFirstSentence = w.addText(items[0].firstSentence)
        artFirstSentence.font = Font.systemFont(9)
        artFirstSentence.minimumScaleFactor = 0.6
        artFirstSentence.lineLimit = 2
    
        w.addSpacer(0.5)
    
    let artFooter = w.addText(ressort.toUpperCase() + " • " + df.string(new Date(items[0].date)) + " Uhr")
        artFooter.font = Font.italicSystemFont(5)
        artFooter.lineLimit = 1
        artFooter.textOpacity = 0.7
    
    return w
};


//--------- CREATE SMALL WIDGET ---------
async function createSmallWidget(){
  let w = new ListWidget()
      w.setPadding(7, 7, 7, 4)
      w.url = shareURL
      w.refreshAfterDate = new Date(Date.now() + 1000*60* CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundImage = (items[0].teaserImage == undefined) ? await tModule.getImageFor("background") : await tModule.loadImage(items[0].teaserImage.imageVariants["1x1-840"])
      
  let headerImage = w.addImage(await tModule.getImageFor('appIconRounded'))
      headerImage.imageSize = new Size(25, 25)
      //headerImage.imageOpacity = 0.5
      //headerImage.cornerRadius = 13
    
  if (uCheck.needUpdate){
      updateInfo = w.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
      updateInfo.font = Font.semiboldSystemFont(10)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5)
      updateInfo.shadowRadius = 4
      updateInfo.centerAlignText()
}
  
      w.addSpacer()

  let articleInfo = w.addStack()
      articleInfo.bottomAlignContent()
      articleInfo.layoutVertically()

  let articleRessort = articleInfo.addText(ressort.toUpperCase())
      articleRessort.textColor = Color.orange()
      articleRessort.font = Font.semiboldSystemFont(9)
      articleRessort.shadowColor = Color.black()
      articleRessort.shadowOffset = new Point(5, 5)
      articleRessort.shadowRadius = 3

  let articleTitle = articleInfo.addText(breakingNews + items[0].title.replaceAll('+', '').trim())
      articleTitle.textColor = Color.white()
      articleTitle.font = Font.boldSystemFont(14)
      articleTitle.minimumScaleFactor = 0.4
      articleTitle.shadowColor = Color.black()
      articleTitle.shadowOffset = new Point(2, 5)
      articleTitle.shadowRadius = 5

  let articleDate = articleInfo.addText(df.string(new Date(items[0].date)) + " Uhr")
      articleDate.font = Font.italicSystemFont(8)
      articleDate.textOpacity = 0.7
      articleDate.textColor = Color.white()
      articleDate.shadowColor = Color.black()
      articleDate.shadowOffset = new Point(5, 5)
      articleDate.shadowRadius = 3    

return w
};


//--------- CREATE MEDIUM WIDGET ---------
async function createMediumWidget(){
  let w = new ListWidget()
      w.setPadding(10, 5, 10, 7)
      w.refreshAfterDate = new Date(Date.now() + 1000*60* CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundImage = await tModule.getImageFor('background')
      
  let headerImage = w.addImage(await tModule.getImageFor('header'))
      headerImage.imageSize = new Size(105, 25)
      headerImage.tintColor = Color.white()
      headerImage.centerAlignImage()
      headerImage.applyFillingContentMode()
    
  if (uCheck.needUpdate){
      updateInfo = w.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5)
      updateInfo.shadowRadius = 4
      updateInfo.centerAlignText()
}
      
      w.addSpacer(2)
      
  let mainStack = w.addStack()
      
  for (i=0; i<2; i++) await tModule.createLargeArticleView(items, w, i);

return w
};


//--------- CREATE MEDIUM DETAIL WIDGET ---------
async function createMediumDetailWidget(){
  let w = new ListWidget()
      w.setPadding(10, 7, 10, 7)
      w.refreshAfterDate = new Date(Date.now()+1000*60*CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundImage = await tModule.getImageFor('background')
      
  let headerImage = w.addImage(await tModule.getImageFor('header'))
      headerImage.imageSize = new Size(105, 25)
      headerImage.tintColor = Color.white()
      headerImage.centerAlignImage()
      headerImage.applyFillingContentMode()
    
  if (uCheck.needUpdate){
      updateInfo = w.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5)
      updateInfo.shadowRadius = 4
      updateInfo.centerAlignText()
}
      
      w.addSpacer()
    
  let mainStack = w.addStack()
      mainStack.size = new Size(315, 105)
      mainStack.topAlignContent()
  
  let articleImage = (items[0].teaserImage == undefined) ? mainStack.addImage(await tModule.getImageFor("Eilmeldung_NoThumbnailFound")) : mainStack.addImage(await tModule.loadImage(items[0].teaserImage.imageVariants["16x9-1920"]))
      articleImage.cornerRadius = 15
      articleImage.imageSize = new Size(160, 90)
      articleImage.url = shareURL
      articleImage.applyFillingContentMode
      
      mainStack.addSpacer(4)
      
  let articleInfo = mainStack.addStack()
      articleInfo.layoutVertically()
      articleInfo.size = new Size(144, 105)

  let articleRessort = articleInfo.addText(ressort.toUpperCase()+" ↗")
      articleRessort.textColor = Color.orange()
      articleRessort.font = Font.semiboldMonospacedSystemFont(10)
      articleRessort.url = "https://tagesschau.de/"+ressort

  let articleTitle = articleInfo.addText(breakingNews + items[0].title.replaceAll('+', '').trim())
      articleTitle.textColor = Color.white()
      articleTitle.font = Font.headline()
      articleTitle.minimumScaleFactor = 0.5
      
  let artFirstSentence = articleInfo.addText(items[0].firstSentence)
      artFirstSentence.font = Font.regularSystemFont(13)
      artFirstSentence.minimumScaleFactor = 0.7
      artFirstSentence.textColor = Color.white()
      artFirstSentence.shadowColor = Color.black()
      artFirstSentence.lineLimit = 5
      artFirstSentence.shadowOffset = new Point(3, 3)
      artFirstSentence.shadowRadius = 5

  let articleDate = articleInfo.addText(df.string(new Date(items[0].date)) + " Uhr")
      articleDate.font = Font.italicSystemFont(8)
      articleDate.minimumScaleFactor = 0.8
      articleDate.textColor = Color.gray()
      
      w.addSpacer()

return w
};


// --------- CREATE LARGE WIDGET ---------
async function createLargeWidget(){
  let w = new ListWidget()
      w.setPadding(10, 10, 10, 10)
      w.refreshAfterDate = new Date(Date.now()+1000*60*CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundImage = await tModule.getImageFor('background')
      
  let headerStack = w.addStack()
      headerStack.centerAlignContent()
      headerStack.spacing = 10
      
  let iconImage = headerStack.addImage(await tModule.getImageFor('appIcon'))
      iconImage.imageSize = new Size(27, 27)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await tModule.getImageFor('header'))
      headerImage.imageSize = new Size(145, 27)
      headerImage.tintColor = Color.white()
      headerImage.centerAlignImage()
      headerImage.applyFillingContentMode()
  
  if (uCheck.needUpdate){
      updateInfo = w.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5)
      updateInfo.shadowRadius = 4
      updateInfo.centerAlignText()
}
  
   w.addSpacer(3)

   for (i=0; i<6; i++) await tModule.createLargeArticleView(items, w, i)

return w
};


// --------- CREATE LARGE DETAIL WIDGET ---------
async function createLargeDetailWidget(){
  let w = new ListWidget()
      w.setPadding(10, 10, 5, 10)
      w.refreshAfterDate = new Date(Date.now() + 1000*60* CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundImage = await tModule.getImageFor('background')
      
  let headerStack = w.addStack()
      headerStack.bottomAlignContent()
      headerStack.spacing = 12
      
  let iconImage = headerStack.addImage(await tModule.getImageFor('appIcon'))
      iconImage.imageSize = new Size(25, 25)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await tModule.getImageFor('header'))
      headerImage.imageSize = new Size(120, 25)
      headerImage.tintColor = Color.white()
      headerImage.centerAlignImage()
      headerImage.applyFillingContentMode()
    
  if (uCheck.needUpdate){
      updateInfo = w.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5)
      updateInfo.shadowRadius = 4
      updateInfo.centerAlignText()
}
      
      w.addSpacer(10)
      headerStack.addSpacer()
 
  let headerRessortStack = headerStack.addStack()
      headerRessortStack.setPadding(2, 6, 2, 6)
      headerRessortStack.cornerRadius = 7
      headerRessortStack.bottomAlignContent()
      headerRessortStack.backgroundColor = new Color('#41414180')
      headerRessortStack.url = "https://tagesschau.de/"+ressort
      
  let artRessort = headerRessortStack.addText(ressort.toUpperCase() + ' ↗')
      artRessort.font = Font.semiboldSystemFont(9)
      artRessort.textColor = Color.orange()
      
  let artTitle = w.addText(breakingNews + items[0].title.replaceAll('+', '').trim())
      artTitle.font = Font.boldSystemFont(15)
      artTitle.lineLimit = 1
      artTitle.minimumScaleFactor = 0.7
      artTitle.textColor = Color.white()
      artTitle.shadowColor = Color.black()
      artTitle.shadowOffset = new Point(3, 3)
      artTitle.shadowRadius = 5

  let artFirstSentence = w.addText(items[0].firstSentence)
      artFirstSentence.font = Font.regularSystemFont(13)
      artFirstSentence.minimumScaleFactor = 0.7
      artFirstSentence.textColor = Color.white()
      artFirstSentence.lineLimit = 2
      artFirstSentence.shadowColor = Color.black()
      artFirstSentence.shadowOffset = new Point(3, 3)
      artFirstSentence.shadowRadius = 5
       
      w.addSpacer(4)
  
  let imageStack = w.addStack()
      imageStack.size = new Size(307, 163)
      imageStack.cornerRadius = 15
      imageStack.spacing = 10
      
  let artImage = (items[0].teaserImage == undefined) ? imageStack.addImage(await tModule.getImageFor("Eilmeldung_NoThumbnailFound")) : imageStack.addImage(await tModule.loadImage(items[0].teaserImage.imageVariants["16x9-1920"]))
      artImage.applyFillingContentMode()
      artImage.url = items[0].shareURL
    
      w.addSpacer(3)
    
  let artContent = w.addText(items[0].content[0].value.replace(/<[^>]*>/g, ''))
      artContent.font = Font.regularSystemFont(12)
      artContent.textColor = Color.white()
      artContent.minimumScaleFactor = 0.8
   
      
  let artDate = w.addText("Stand: " + df.string(new Date(items[0].date)) + " Uhr")
      artDate.font = Font.italicSystemFont(9)
      artDate.textColor = Color.gray()

return w 
};


//--------- CREATE EXTRA LARGE WIDGET ---------
//Extra large widgets are only supported on iPads running iOS 15 and newer.
async function createExtraLargeWidget(){
  let w = new ListWidget()
      w.setPadding(10, 10, 10, 13)
      w.refreshAfterDate = new Date(Date.now() + 1000*60* CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundImage = await tModule.getImageFor('background')
      
  let headerStack = w.addStack()
      headerStack.centerAlignContent()
      headerStack.setPadding(0, 245, 0, 0)
      headerStack.spacing = 9
      
  let iconImage = headerStack.addImage(await tModule.getImageFor('appIcon'))
      iconImage.imageSize = new Size(27, 27)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await tModule.getImageFor('header'))
      headerImage.imageSize = new Size(135, 25)
      headerImage.tintColor = Color.white()
      headerImage.centerAlignImage()
      headerImage.applyFillingContentMode()
          
  if (uCheck.needUpdate){
      updateInfo = w.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5)
      updateInfo.shadowRadius = 4
      updateInfo.centerAlignText()
}
      
      w.addSpacer()
      
  let mainStack = w.addStack()
      mainStack.spacing = 7
  let leftStack = mainStack.addStack()
      leftStack.layoutVertically()
  let rightStack = mainStack.addStack()
      rightStack.layoutVertically()
      
  for (i=0; i<5; i++) await tModule.createLargeArticleView(items, leftStack, i)
  for (i=5; i<10; i++) await tModule.createLargeArticleView(items, rightStack, i)
          
      w.addSpacer()
      
  return w
}


//--------- CREATE EXTRA LARGE DETAIL WIDGET ---------
//Extra large widgets are only supported on iPads running iOS 15 and newer.
async function createExtralargeDetailWidget(){
  let w = new ListWidget()
      w.setPadding(12, 15, 10, 15)
      w.refreshAfterDate = new Date(Date.now()+1000*60*CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundImage = await tModule.getImageFor('background')
      
  let headerStack = w.addStack()
      headerStack.bottomAlignContent()
      headerStack.spacing = 9
      
  let iconImage = headerStack.addImage(await tModule.getImageFor('appIcon'))
      iconImage.imageSize = new Size(27, 27)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await tModule.getImageFor('header'))
      headerImage.imageSize = new Size(135, 25)
      headerImage.tintColor = Color.white()
      headerImage.centerAlignImage()
      headerImage.applyFillingContentMode()
          
  if (uCheck.needUpdate){
      updateInfo = w.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5)
      updateInfo.shadowRadius = 4
      updateInfo.centerAlignText()
}
    
  let mainStack = w.addStack()
      mainStack.spacing = 14
      mainStack.centerAlignContent()
      
  let leftStack = mainStack.addStack()
      leftStack.layoutVertically()
      leftStack.cornerRadius = 10
      leftStack.size = new Size(325, 300)
      
  let rightStack = mainStack.addStack()
      rightStack.layoutVertically()
          
  let headerRessortStack = leftStack.addStack()
      headerRessortStack.setPadding(4, 6, 4, 6)
      headerRessortStack.cornerRadius = 7
      headerRessortStack.bottomAlignContent()
      headerRessortStack.url = "https://tagesschau.de/"+ressort
      headerRessortStack.backgroundColor = new Color('#41414180')
      
  let artRessort = headerRessortStack.addText(ressort.toUpperCase() + " ↗")
      artRessort.font = Font.semiboldSystemFont(9)
      artRessort.textColor = Color.orange()
      
  let artTitle = leftStack.addText(breakingNews + items[0].title.replaceAll('+', '').trim())
      artTitle.font = Font.boldSystemFont(15)
      artTitle.textColor = Color.white()
      artTitle.shadowColor = Color.black()
      artTitle.lineLimit = 1
      artTitle.minimumScaleFactor = 0.8
      artTitle.shadowOffset = new Point(3, 3)
      artTitle.shadowRadius = 7

  let artFirstSentence = leftStack.addText(items[0].firstSentence)
      artFirstSentence.font = Font.regularSystemFont(13)
      artFirstSentence.textColor = Color.white()
      artFirstSentence.minimumScaleFactor = 0.8
      artFirstSentence.lineLimit = 2
      artFirstSentence.shadowColor = Color.black()
      artFirstSentence.shadowOffset = new Point(3, 3)
      artFirstSentence.shadowRadius = 7
      
      leftStack.addSpacer(2)
  
  let imageStack = leftStack.addStack()
      imageStack.size = new Size(320, 165)
      imageStack.cornerRadius = 20
      imageStack.spacing = 10
	
  let artImage = (items[0].teaserImage == undefined) ? imageStack.addImage(await tModule.getImageFor("Eilmeldung_NoThumbnailFound")) : imageStack.addImage(await tModule.loadImage(items[0].teaserImage.imageVariants["16x9-1920"]))

	   artImage.applyFillingContentMode()
  	   artImage.url = items[0].shareURL
  
      leftStack.addSpacer(2)
    
  let artContent = leftStack.addText(items[0].content[0].value.replace(/<[^>]*>/g, ''))
      artContent.font = Font.regularSystemFont(12)
      artContent.textColor = Color.white()
      artContent.minimumScaleFactor = 0.8

  let articleDate = leftStack.addText("Stand: " + df.string(new Date(items[0].date)) + " Uhr")
      articleDate.font = Font.italicSystemFont(9)
      articleDate.textColor = Color.gray()
     
  for (i=1; i<7; i++) await tModule.createLargeArticleView(items, rightStack, i)
  
      w.addSpacer(5)
      
return w
};


// CREATE TABLE 
async function createTable() {
 if (Device.isPad()){
	 cellWidth = 22
    cellWidth2 = 9
	 rowWidth = 100
 } else if (Device.isPhone()){
    cellWidth = 12
    cellWidth2 = 9
    rowWidth = 90
 }
  
  let nAlert = new Alert()
      nAlert.title = 'Feed Inhalt wählen'
      nAlert.addAction('News')
      nAlert.addAction('Regional')
      nAlert.addAction('Video')
  var idx = await nAlert.present()
  var feedName;
  var items;
  if (idx === 0){
    feedName = 'News'
    items = await tModule.getFromAPI(feedName.toLowerCase(), bulaCode)
    
  } else if (idx === 1){
    feedName = 'Regional'
    items = await tModule.getFromAPI(feedName.toLowerCase(), bulaCode)
    
  } else if (idx === 2){
    feedName = 'Video'
    items = await tModule.getVideosFromAPI(null)
  }
  //= (await nAlert.present() == 0) ? "News" : "Regional"
  
  let table = new UITable()
      table.showSeparators = true
  
  let headerRow = new UITableRow()
      headerRow.backgroundColor = Color.white()
      headerRow.isHeader = true
      headerRow.height = 50
      
      iconCell = UITableCell.image(await tModule.getImageFor('appIconRounded'))
      iconCell.widthWeight = 3
      headerRow.addCell(iconCell)
      
      headerCell = UITableCell.image(await tModule.getImageFor('header'))
      headerCell.widthWeight = 9
      headerRow.addCell(headerCell)
      
      textCell = UITableCell.text(feedName + " Feed ")
      textCell.titleFont = Font.boldSystemFont(15)
      textCell.titleColor = new Color('#07184C')
      textCell.widthWeight = cellWidth
      headerRow.addCell(textCell)

      table.addRow(headerRow)
      plusIdx = 1

  if (uCheck.needUpdate){
    let headerUpdate = new UITableRow()
        headerUpdate.backgroundColor = Color.red()
        headerUpdate.isHeader = true
        headerUpdate.height = 45
      
        headerUpdate.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
        headerUpdate.textColor = Color.white()
        table.addRow(headerUpdate)
        plusIdx += 1
  }
  
  for (item of items){
    let row = new UITableRow()
        row.height = 120
        row.cellSpacing = 10
        row.onSelect = (idx) => {
          let item = items[idx-plusIdx]
          var vid = (item.streams.h264xl == undefined) ? item.tracking[1].c5.split(',')[1] : item.streams.h264xl;
          if (feedName === 'Video') Safari.openInApp(vid, false)
          else if (feedName == 'News' || 'Regional') Safari.openInApp(item.shareURL, false)
          }
        row.dismissOnSelect = false
     
     if (item.breakingNews == true){breakingNews = "⚡️"; row.backgroundColor = new Color('#ede4a680')}
     else breakingNews = ""
    
        ressort = (item.ressort == undefined) ? ressort = "Sonstiges" : ressort = item.ressort
        
        title = (item.title === '') ? 'tageschau24 Stream' : item.title

        imageCell = (item.teaserImage == undefined) ? row.addImage(await tModule.getImageFor('Eilmeldung_NoThumbnailFound')) : row.addImageAtURL(item.teaserImage.imageVariants["16x9-256"])
        imageCell.widthWeight = 4
        
    if (feedName === 'Video'){
        titleCell = row.addText(`${title}`, `${df.string(new Date(item.date))}`)
    } else if (feedName == 'News' || 'Regional'){
        titleCell = row.addText(`${breakingNews}${item.title.replaceAll('+', '').trim()}`, `${item.firstSentence}\n${ressort.toUpperCase()} | ${df.string(new Date(item.date))} Uhr`)
    }  
        
        titleCell.widthWeight = cellWidth2
        
        table.addRow(row)
    }
    
    let creditFooter = new UITableRow()
        creditFooter.height = 40
        creditFooter.cellSpacing = 7
  
    let creditFooterCellImg = UITableCell.imageAtURL('https://cdn-icons-png.flaticon.com/512/25/25231.png')
        creditFooterCellImg.widthWeight = 1
  
    let creditFooterCellbutton = UITableCell.button("Created by iamrbn - Show on GitHub↗")
        creditFooterCellbutton.widthWeight = 15
        creditFooterCellbutton.onTap = () => Safari.openInApp("https://github.com/iamrbn/tagesschau-widget", false)
   
        creditFooter.addCell(creditFooterCellImg)
        creditFooter.addCell(creditFooterCellbutton)
        table.addRow(creditFooter)
    
 return table
};


//Loads javascript module if needed
async function loadModule(){
   req = new Request('https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/tagesschauModule.js')
   moduleFile = await req.loadString()
   fm.writeString(modulePath, moduleFile)
   console.warn('loaded module file from github')
};


//============ END OF SCRIPT ============\\
//=======================================\\
