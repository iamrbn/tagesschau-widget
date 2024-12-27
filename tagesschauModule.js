
//=========================================//
//============ START OF MODULE ============//
//=============== Version 1.2 =============//


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
async function getFromAPI(feedtype, bula){
  let bulaCode = await getBundeslandCode(bula)
  try {
        req = await Object.assign(new Request('https://www.tagesschau.de/api2u/news'), { timeoutInterval: 60 * 30 }).loadJSON()
        res = req['news']
        if (feedtype == 'news') items = res.filter(item => [0].includes(item.regionId))
        else if (feedtype == 'regional') items = res.filter(item => bulaCode.includes(item.regionId))
    } catch(err){
        console.error(getFromAPI.name + err)
        items = 404
    }
    
  return items
};


//Get datas from tagesschau Video-API
async function getVideosFromAPI(c, input){
    let nKey = Keychain
    try {
        req = await Object.assign(new Request('https://www.tagesschau.de/api2u/channels'), { timeoutInterval: 60 * 30 }).loadJSON()
        res = req['channels']
        if (input === null) videos = res
        else {
            videos = res.find(element => element.title == 'tagesschau in 100 Sekunden');
            if (!nKey.contains("current_podcast")) nKey.set("current_podcast", videos.tracking[0].pdt)
            if (c.DEVICES[Device.model()].tagesschau100sec && nKey.get("current_podcast") != videos.tracking[0].pdt) await notificationSchedulerVid(videos, nKey)
        }
    } catch(err){
        console.error(getVideosFromAPI.name +  err)
        videos = 404
    }
    return videos
};


//Get datas from tagesschau Homepage-API
async function getFromHomepageAPI(c, bula){
    let nKey = Keychain
    let bulaCode = await getBundeslandCode(bula)
    let arr = [];
    let sortArr;
    try {
        req = await Object.assign(new Request('https://www.tagesschau.de/api2u/homepage'), { timeoutInterval: 60 * 30 }).loadJSON()
        res = req['regional']
        item = res.filter(item => bulaCode.includes(item.regionId))
        arr = [req['news'][0], item[0]]
        sortArr = arr.sort((a, b) => new Date(arr[0].date) - new Date(arr[1].date))[0];
        if (!nKey.contains("current_title_idx0")) nKey.set("current_title_idx0", sortArr.title)
        if (c.DEVICES[Device.model()].enableNotifications && nKey.get("current_title_idx0") != sortArr.title) await notificationScheduler(sortArr, nKey)
    } catch(err){
        console.error(getFromHomepageAPI.name + err)
        sortArr = 404
    }
    return sortArr
};


//Get Code/Number of Bundesland
async function getBundeslandCode(bulaName){
    if (bulaName === ''){
        blCode = Object.values(blCodes)
    } else {
        keys = bulaName.split(',').map(key => key.trim())
        var blCode = keys.map(key => {
          const upperKey = key.toUpperCase()
          return blCodes[upperKey] || null
          })
     }
    //log({blCode})
    return blCode
};


//Saves Images from GitHub Repo
async function saveImages(){
 fm = FileManager.iCloud()
 dir = fm.joinPath(fm.documentsDirectory(), 'tagesschau-widget')
 imgs = {
     tagesschauBackground: "https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/Images/tagesschauBackground.png",
     tagesschauBackground05: "https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/Images/tagesschauBackground05.png",
     tagesschauHeader: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tagesschau_Logo_2015.svg/462px-Tagesschau_Logo_2015.svg.png",
     appIcon: "https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/e4/53/54/e45354a1-b99f-8a00-2d1c-d260607c2ec0/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.png",
     appIconRounded: "https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/Images/appIconRounded.png",
     placeholderThumbnail: "https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/Images/placeholderThumbnail.png",
     tagesschau_trademark_monochrLS: "https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/Images/tagesschau_trademark_monochrLS.png"
    }
  for (img in imgs){
    imgName = img + ".png"
    imgPath = fm.joinPath(dir, imgName)
   if (!fm.fileExists(imgPath)){
      img = await new Request(imgs[img]).loadImage()
      fm.writeImage(imgPath, img)
    }
  }
};


//Loads Images from iCloud Drive or internet
async function getImage(input){
    fm = FileManager.iCloud()
    dir = fm.joinPath(fm.documentsDirectory(), 'tagesschau-widget')
    try {
        imgPath = fm.joinPath(dir, input + ".png")
        await fm.downloadFileFromiCloud(imgPath)
        img = await fm.readImage(imgPath)
    } catch (e){
        if (input.includes('https://images.tagesschau.de/')) console.warn(e.message + ' => ' + input)
        try {
            console.log('loading thumbnail from web...')
            img = await new Request(input).loadImage()
        } catch(err){
            console.warn('Error loading image from given url: ' + err.message)
            imgPath = fm.joinPath(dir, "placeholderThumbnail.png")
            await fm.downloadFileFromiCloud(imgPath)
            img = await fm.readImage(imgPath)
        }
    }
    
 return img
};


async function getHighestImage(itm, idx,  formatSize){
    // formatSize: 1x1 & 16x9
    let getAllKeys = (idx === null) ? itm?.teaserImage?.imageVariants : itm[idx]?.teaserImage?.imageVariants;
         getKeys = Object.keys(getAllKeys).filter(key => key.startsWith(formatSize))
         sortKeys = getKeys.sort((a, b) =>  a.split("-")[1] - b.split("-")[1])
         mappedKeys = sortKeys.map(key => ({ size: key, url: getAllKeys[key] })) //item[idx]?.teaserImage?.imageVariants[key] }))
         
    url = mappedKeys[mappedKeys.length-1].url
    
    return url
   };


async function createHeader(viewType, widgetBase, feedName){
    if (viewType === 'fullscreen'){
        let headerStack = widgetBase.addStack()
             headerStack.setPadding(0, 7, 0, 0)
             if (config.widgetFamily === 'small') headerStack.setPadding(0, 0, 0, 0)
             headerStack.centerAlignContent()
             headerStack.spacing = 4
             
             iconSize = (config.widgetFamily === 'small') ? 22 :
                               (config.widgetFamily === 'medium') ? 24 : 30;
        let icon = headerStack.addImage(await getImage('appIconRounded')).imageSize = new Size(iconSize, iconSize)
      
        let ressortSize = (config.widgetFamily === 'small') ? 12 :
                                   (config.widgetFamily === 'medium') ? 18 : 19;
             
        let ressortName = headerStack.addText(feedName)
             ressortName.font = Font.lightMonospacedSystemFont(ressortSize)
             ressortName.textColor = Color.white()
             ressortName.shadowColor = Color.black()
             ressortName.shadowOffset = new Point(1, 1)
             ressortName.shadowRadius = 1
      
             headerStack.addSpacer()
      
             widgetBase.addSpacer()
    } else {
        if (config.widgetFamily == 'medium' || 'large'){
            // medium & large
            let headerStack = widgetBase.addStack()
                 headerStack.centerAlignContent()
                 headerStack.addSpacer(3)
            
            if (config.widgetFamily === 'medium' && viewType === 'detailview') headerStack.addSpacer()
         
            let headerImage = headerStack.addImage(await getImage('tagesschauHeader'))
                 headerImage.imageSize = new Size(120, 30)
                 headerImage.tintColor = Color.white()
            
                 headerStack.addSpacer(4)
         
            let headerRessort = headerStack.addText(feedName)
                 headerRessort.font = Font.lightMonospacedSystemFont(16)
          
                 headerStack.addSpacer()
            
            if (config.widgetFamily === 'medium' && viewType === 'detailview') widgetBase.addSpacer(5)
         
        } else if (config.widgetFamily === 'extraLarge'){
            // extraLarge detailview
            let headerStack = widgetBase.addStack()
                 headerStack.centerAlignContent()
                 //if (viewType) headerStack.setPadding(0, 245, 0, 0)
                 headerStack.backgroundColor = Color.green()
                 headerStack.spacing = 9
         
            let iconImage = headerStack.addImage(await getImage('appIcon'))
                 iconImage.imageSize = new Size(27, 27)
                 iconImage.cornerRadius = 7
         
            let headerImage = headerStack.addImage(await getImage('tagesschauHeader'))
                 headerImage.imageSize = new Size(135, 25)
                 headerImage.tintColor = Color.white()
                 headerImage.centerAlignImage()
                 headerImage.applyFittingContentMode() //applyFillingContentMode
         
            let headerRessort = headerStack.addText(feedName)
                 headerRessort.font = Font.semiboldMonospacedSystemFont(16)
                 headerRessort.textColor = Color.white()
         
                 widgetBase.addSpacer()
        }
    }
};


// fullscreen for small, medium & large widget
async function createFullscreen(widgetBase, item){
    breakingNews = (item[0]?.breakingNews == true) ? '⚡️ ' : ''
    ressort = item[0]?.ressort ?? 'Sonstiges'
    shareURL = item[0]?.shareURL ?? `https://tagesschau.de/${ressort}`
    df = Object.assign(new DateFormatter(), {dateFormat: 'dd. MMMM yyyy HH:mm' })
    
    articleInfoSize = (config.widgetFamily === 'medium') ? 10 : 12;
    titleSize = (config.widgetFamily === 'medium') ? 14 : 18;
    subSize = (config.widgetFamily === 'medium') ? 10 : 14;
    
    let blackStack = widgetBase.addStack()
         blackStack.layoutVertically()
         blackStack.backgroundGradient = await createGradient('#00000003', '#000000D9', '#000000FF')
         blackStack.centerAlignContent()
         blackStack.url = shareURL
         if (config.widgetFamily === 'medium') blackStack.setPadding(7, 7, 7, 7)
         else blackStack.setPadding(25, 10, 10, 10)
    
    let firstLine = blackStack.addStack()
         firstLine.centerAlignContent()
    
    let articleRessort = firstLine.addText(ressort.toUpperCase()+'↗')
         articleRessort.url = `https://tagesschau.de/${ressort}`
         articleRessort.textColor = Color.orange()
         articleRessort.font = Font.boldMonospacedSystemFont(articleInfoSize)
         articleRessort.shadowColor = Color.black()
         articleRessort.shadowOffset = new Point(1, 1)
         articleRessort.shadowRadius = 1
    
    let articleDate = firstLine.addText(' • ' + df.string(new Date(item[0].date))+' Uhr')
         articleDate.font = Font.italicSystemFont(articleInfoSize)
         articleDate.textOpacity = 0.7
         articleDate.textColor = Color.white()
         articleDate.shadowColor = Color.black()
         articleDate.shadowOffset = new Point(1, 1)
         articleDate.shadowRadius = 1
    
         firstLine.addSpacer()
    
    let articleTitle = blackStack.addText(breakingNews + item[0].title.replaceAll('+', '').trim())
         articleTitle.textColor = Color.white()
         articleTitle.font = Font.boldSystemFont(titleSize)
         articleTitle.minimumScaleFactor = 0.8
         articleTitle.lineLimit = 3
    
    let articleSubtitle = blackStack.addText(item[0].firstSentence)
         articleSubtitle.textColor = Color.white()
         articleSubtitle.font = Font.regularSystemFont(subSize)
         articleSubtitle.minimumScaleFactor = 0.7
         articleSubtitle.lineLimit = 4
};


// Creates Article View of the Large Widget
async function createArticleList(items, base, index, bg, fs){
 let df = Object.assign(new DateFormatter(), {dateFormat: 'dd. MMMM YYYY HH:mm' })
      
  if (items[index] == undefined) index = Math.floor(Math.random()* index)
     
  let mainStack = base.addStack()
  if (bg) mainStack.backgroundColor = new Color('#41414180')
       mainStack.cornerRadius = 15
       mainStack.spacing = 7
       mainStack.setPadding(2, 2, 2, 2)
       mainStack.centerAlignContent()
    
  let imageStack = mainStack.addStack()
       
  let breakingNews = (items[index]?.breakingNews == true) ? '⚡️ ' : ''
  let img = imageStack.addImage(await getImage(await getHighestImage(items, index, '16x9')))
       img.applyFillingContentMode
       img.cornerRadius = 15
      
  let textStack = mainStack.addStack()
       textStack.layoutVertically()
       textStack.centerAlignContent()
      
  let headerArt = textStack.addStack()
       headerArt.centerAlignContent()
      
  let ressortTxt = items[index]?.ressort ?? 'Sonstiges'
  
       mainStack.url = items[index]?.shareURL ?? 'https://tagesschau.de/'+ ressortTxt
  
  let ressort = headerArt.addText(ressortTxt.toUpperCase())
       ressort.textColor = Color.orange()
       ressort.font = Font.semiboldSystemFont(9)
       ressort.lineLimit = 1
       ressort.url = "https://tagesschau.de/" + ressortTxt
      
 if (!bg) df.dateFormat = 'dd. MMM HH:mm' //view === 'detailview'
 let date = headerArt.addText(' • ' + df.string(new Date(items[index].date))+" Uhr")
      date.font = Font.italicSystemFont(8)
      date.textColor = Color.white()
      date.textOpacity = 0.8
      date.lineLimit = 1
      //date.minimumScaleFactor = 0.8
      
  let title = textStack.addText(breakingNews + items[index].title.replaceAll('+', '').trim())
       title.font = Font.boldSystemFont(12)
       title.textColor = Color.white()
       title.minimumScaleFactor = 0.6
       title.lineLimit = 3
       
    if (fs){
        firstSentence =  textStack.addText(items[index].firstSentence)
        firstSentence.font = Font.lightSystemFont(10)
        firstSentence.textColor = Color.white()
        firstSentence.minimumScaleFactor = 0.4
        firstSentence.lineLimit = 4
    }

      mainStack.addSpacer()
      base.addSpacer(4)
};


//Creates Article View of Widget
async function createArticleView(items, base){
    let df = Object.assign(new DateFormatter(), {dateFormat: 'dd. MMMM yyyy HH:mm' });
    let breakingNews = (items[0].breakingNews == true) ? '⚡️ ' : ''
    let ressort = items[0]?.ressort ?? 'Sonstiges'
         base.url = items[0]?.shareURL ?? `https://tagesschau.de/${ressort}`
    
    let artInfoStack = base.addStack()
         artInfoStack.centerAlignContent()
         artInfoStack.url = "https://tagesschau.de/"+ressort
    
    let artRessort = artInfoStack.addText(ressort.toUpperCase() + '↗')
         artRessort.font = Font.boldMonospacedSystemFont(11)
         artRessort.textColor = Color.orange()
    
    let artTitle = base.addText(breakingNews + items[0].title.replaceAll('+', '').trim())
         artTitle.font = Font.boldSystemFont(15)
         artTitle.lineLimit = 3
         artTitle.minimumScaleFactor = 0.7
         artTitle.textColor = Color.white()
         artTitle.shadowColor = Color.black()
         artTitle.shadowOffset = new Point(1, 1)
         artTitle.shadowRadius = 1

    let artFirstSentence = base.addText(items[0].firstSentence)
         artFirstSentence.font = Font.lightSystemFont(12)
         artFirstSentence.minimumScaleFactor = 0.7
         artFirstSentence.textColor = Color.white()
         artFirstSentence.lineLimit = 4
         artFirstSentence.shadowColor = Color.black()
         artFirstSentence.shadowOffset = new Point(1, 1)
         artFirstSentence.shadowRadius = 1
           
         base.addSpacer(7)
    
    let artImage = base.addImage(await getImage(await getHighestImage(items, 0, '16x9')))
         artImage.cornerRadius = 18
         artImage.applyFittingContentMode()
         artImage.url = items[0].shareURL
           
         base.addSpacer(3)

    let artContent = base.addText(items[0]?.content?.[0]?.value.replace(/<[^>]*>/g, '') ?? '')
         artContent.font = Font.regularSystemFont(10)
         artContent.textColor = Color.white()
         artContent.minimumScaleFactor = 0.5
         artFirstSentence.shadowOffset = new Point(1, 1)
         artFirstSentence.shadowRadius = 1
   
    let artDate = artInfoStack.addText(' • ' + df.string(new Date(items[0].date)) + " Uhr")
         artDate.font = Font.italicSystemFont(11)
         artDate.textColor = Color.white()
         artDate.textOpacity = 0.7
         artFirstSentence.shadowOffset = new Point(1, 1)
         artFirstSentence.shadowRadius = 1
};


async function createVideoView(videoURL){
    const html = `
        <html>
        <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: black;">
            <video id="video" controls autoplay style="max-width: 100%; max-height: 100%;">
                <source src="${videoURL}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </body>
        </html>
    `;
    
    wv = new WebView();
    await wv.loadHTML(html);
    await wv.waitForLoad();
    
    return QuickLook.present(wv, false)
};


//Create Notifications of Videos
async function notificationSchedulerVid(video, k){
    df = Object.assign(new DateFormatter(), { dateFormat: 'dd. MMMM HH:mm' })
    
    n = new Notification()
    n.title = video.title
    n.body = 'vom ' + df.string(new Date(video.date)) + ' Uhr'
    //n.addAction("Video im Browser Öffnen ▶︎", video.streams.h264xl, true)
    n.addAction("⌧ Löschen", video.streams.h264xl, true)
    n.openURL = video.streams.h264xl
    n.identifier = 'tagesschau100Sec'
    n.preferredContentHeight = (Device.isPad()) ? 320 : 225
    n.threadIdentifier = Script.name()
    n.scriptName = Script.name()
    n.userInfo = { "thumbnail": await getHighestImage(video, null, '16x9') }//video.teaserImage.imageVariants["1x1-840"]  ?? null} //16x9-1920
    n.schedule()
    
    k.set("current_podcast", video.tracking[0].pdt)
};


//Create Notifications
async function notificationScheduler(item, k){
    df = Object.assign(new DateFormatter(), { dateFormat: 'dd. MMM HH:mm' })
    //img = (item.teaserImage == undefined) ? null : item?.teaserImage?.imageVariants["16x9-1920"]
    //log(notificationScheduler.name + ' => ' + await getHighestImage(item, null, '16x9'))
    bn = (items?.breakingNews == true) ? '⚡️ ' : ''
    
    n = new Notification()
    n.subtitle = item.title
    n.title = (item.ressort ?? 'SONSTIGES').toUpperCase() + ' • ' + df.string(new Date(item.date)) + ' Uhr'
    //n.body = `${item.content[0].value.replace(/<[^>]*>/g, '')}`
    n.body = bn + item?.content?.[0]?.value.replace(/<[^>]*>/g, '') ?? ''
    n.addAction("⌧ Löschen", item.shareURL, true)
    n.identifier = item.sophoraId
    n.threadIdentifier = Script.name()
    n.preferredContentHeight = (Device.isPad()) ? 320 : 225
    n.openURL = item.shareURL
    n.scriptName = Script.name()
    n.userInfo = { "thumbnail": await getHighestImage(item, null, '16x9') }//item?.teaserImage?.imageVariants["16x9-1920"]
    
    k.set("current_title_idx0", item.title)
    
    return n.schedule()
};


async function createGradient(color1, color2, color3){
    let gradient = Object.assign(new LinearGradient(), {
            colors: [new Color(color1), new Color(color2), new Color(color3)],
            locations: [0, 0.5, 1]
    })
   return gradient
};


//Creates Error Widget
async function infoWidget(type, update){
    infoWidget = Object.assign(new ListWidget(), { refreshAfterDate: new Date(Date.now() + 1000 * 60 * 3) })
    
    if (update.needUpdate){
        symbol = 'gear.badge'
        title = `Update ${update.uC.version} ist jetzt Verfügbar`
        body = 'Starte das Script in der App zum Updaten'
        short = `Update ${update.uC.version}\nVerfügbar`
    } else if (type === 404){
        symbol = 'network.slash'
        title = 'Keine Antwort der tagesschau API'
        body = 'Bitte prüfe deine Netzwerkverbindung'
        short = 'Keine API\nAntwort'
    }
    
    sf = SFSymbol.named(symbol)
    sf.applyFont(Font.lightRoundedSystemFont(200))
    
    if (config.widgetFamily === 'accessoryCircular'){
        infoWidget.addAccessoryWidgetBackground = true
        title = infoWidget.addText(short)
        title.font = Font.boldMonospacedSystemFont(8)
        title.minimumScaleFactor = 0.7
        //title.lineLimit = 3
        title.centerAlignText()
    } else if (config.widgetFamily === 'accessoryRectangular'){
        infoWidget.addAccessoryWidgetBackground = true
        infoWidget.setPadding(2, 0, 2, 0)
        title = infoWidget.addText(title)
        title.font = Font.boldMonospacedSystemFont(10)
        title.minimumScaleFactor = 0.7
        title.centerAlignText()
        infoWidget.addSpacer(2)
        subtitle = infoWidget.addText(body)
        subtitle.font = Font.regularMonospacedSystemFont(9)
        subtitle.minimumScaleFactor = 0.8
        subtitle.centerAlignText()
        img = infoWidget.addImage(sf.image)
        img.centerAlignImage()
    } else if (config.widgetFamily === 'small'){
        infoWidget.setPadding(10, 5, 10, 5)
        infoWidget.backgroundGradient = await createGradient('#005AB4', '#023980', '#001749')
        
        infoWidget.addSpacer()
        
        iTitle = infoWidget.addText(title)
        iTitle.font = Font.semiboldSystemFont(14)
        iTitle.textColor = Color.red()
        iTitle.centerAlignText()
        
        infoWidget.addSpacer()
        
        iBody = infoWidget.addText(body)
        iBody.font = Font.regularSystemFont(13)
        iBody.textColor = Color.red()
        iBody.centerAlignText()
        
        infoWidget.addSpacer()
        
        errImg = infoWidget.addImage(sf.image)
        errImg.tintColor = Color.white()
        errImg.imageOpacity = 0.5
        errImg.centerAlignImage()
        
        infoWidget.addSpacer()
    } else {
        infoWidget.setPadding(20, 10, 20, 10)
        infoWidget.backgroundGradient = await createGradient('#005AB4', '#023980', '#001749')
        
        infoWidget.addSpacer()
        
        iTitle = infoWidget.addText(title)
        iTitle.font = Font.boldSystemFont(18)
        iTitle.textColor = Color.red()
        iTitle.centerAlignText()
        
        infoWidget.addSpacer()
        
        iBody = infoWidget.addText(body)
        iBody.font = Font.semiboldSystemFont(17)
        iBody.textColor = Color.red()
        iBody.centerAlignText()
        
        infoWidget.addSpacer()
        
        errImg = infoWidget.addImage(sf.image)
        errImg.tintColor = Color.white()
        errImg.imageOpacity = 0.5
        errImg.centerAlignImage()
        
        infoWidget.addSpacer()
    }

  return infoWidget
};


//Checks if's there an server update on GitHub available
async function updateCheck(version){
    fm = FileManager.iCloud()
    dir = fm.joinPath(fm.documentsDirectory(), 'tagesschau-widget')
    
    url = 'https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/'
    endpoints = ['tagesschau-widget.js', 'tagesschauModule.js']

    try {
        uC = await new Request(url+endpoints[0]+'on').loadJSON()
    } catch (err){
        console.error(err.message)
        uC = 404
    }
    
    needUpdate = false
    if (typeof uC !== 'number' && uC.version > version){
        needUpdate = true
        if (config.runsInApp){
            //console.error(`New Server Version ${uC.version} Available`)
            newAlert = Object.assign(new Alert(), { title: `Neue Server Version ${uC.version} Verfügbar!`, message: "Änderungen:\n" + uC.notes + "\n\nOK klicken für den Download von GitHub\n Mehr Infos zum Update siehe Github Repo"})
            newAlert.addAction("OK")
            newAlert.addDestructiveAction("Später")
            if (await newAlert.present() == 0){
                updatedCode = await new Request(url+endpoints[0]).loadString()
                codePath = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`)
                fm.writeString(codePath, updatedCode)
                moduleFile = await new Request(url+endpoints[1]).loadString()
                modulePath = fm.joinPath(dir, 'tagesschauModule.js')
                fm.writeString(modulePath, moduleFile)
                throw "Update Komplett!"
            } else {
                throw "Update Abgebrochen!"
            }
        }
   } else if (typeof uC === 'number'){
      needUpdate = false
   } else if (uC.version = version){
      console.log(">> SCRIPT IS UP TO DATE!")
   }
  
  return {uC, needUpdate}
};


//Exports Functions
module.exports = {
    getFromAPI,
    createArticleList,
    infoWidget,
    createHeader,
    updateCheck,
    createFullscreen,
    saveImages,
    getImage,
    getHighestImage,
    createGradient,
    notificationSchedulerVid,
    notificationScheduler,
    createArticleView,
    getBundeslandCode,
    getVideosFromAPI,
    createVideoView,
    getFromHomepageAPI
};


//=========================================//
//============= END OF MODULE =============//
//=========================================//
