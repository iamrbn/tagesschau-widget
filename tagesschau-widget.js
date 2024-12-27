// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: globe-africa;
// created by iamrbn → https://github.com/iamrbn/tagesschau-widget
// Inspitiert durch u/trbn_hck (mehr dazu in der GitHub Repo)

//==============================================
//!!!!!!!!!!! START OF CONFIG ZONE !!!!!!!!!!!!!

let feedtype = 'news' // Standard Feed Typ eingeben 'news' oder 'regional' möglich!
let bundesland = 'baden-württemberg' // 'baden-württemberg' // für alle BL bitte leere hochkommatas ('') verwenden; für mehrere BL diese bitte mit komma getrennt aneinander reihen!
let background = 'tagesschauBackground05' // tagesschauBackground = classic; tagesschauBackground05 = abgedunkelt;
let CONFIGS = {
        DEVICES: {
         iPad: {
          enableNotifications: false, //true: Neue Pushnachrichten erlauben; ansonsten 'false'
          tagesschau100sec: true, //true: für Pushnachrichten bei neuer Folge
          refreshInt: 90
         },
         iPhone: {
          enableNotifications: true,
          tagesschau100sec: true,
          refreshInt: 45
         }
       }
      };

//!!!!!!!!!!!! END OF CONFIG ZONE !!!!!!!!!!!!!!!
//===============================================
//--- Änderungen ab hier auf eigene Gefahr!!! ---

let wPar = await args.widgetParameter
let nPar = await args.notification
let df = Object.assign(new DateFormatter(), { dateFormat: 'dd.MM.yyyy HH:mm' })
let fm = FileManager.iCloud()
let dir = fm.joinPath(fm.documentsDirectory(), 'tagesschau-widget')
if (!fm.fileExists(dir)) fm.createDirectory(dir)
let modulePath = fm.joinPath(dir, 'tagesschauModule.js')
if (!fm.fileExists(modulePath)) await loadModule()
if (!fm.isFileDownloaded(modulePath)) await fm.downloadFileFromiCloud(modulePath)
let tModule = importModule(modulePath)
let uCheck = await tModule.updateCheck(1.6)
await tModule.saveImages()

if (wPar == null) wPar = feedtype
else if (wPar.toLowerCase().includes("regional")) feedtype = 'regional'
else if (wPar.toLowerCase().includes("news")) feedtype = 'news'

if (wPar.toLowerCase().includes("detailview")) viewType = 'detailview'
else if (wPar.toLowerCase().includes('fullscreen')) viewType = 'fullscreen'
else viewType = null

let items = await tModule.getFromAPI(feedtype, bundesland)
let breakingNews = (items[0]?.breakingNews == true) ? '⚡️ ' : ''
let ressort = items[0]?.ressort ?? 'Sonstiges'
let shareURL = items[0]?.shareURL ?? `https://tagesschau.de/${ressort}`
await tModule.getFromHomepageAPI(CONFIGS, bundesland)
await tModule.getVideosFromAPI(CONFIGS)

if (config.runsInApp && typeof items !== 'number'){
    await setFeed()
} else if (config.runsInWidget || config.runsInAccessoryWidget){
  switch (config.widgetFamily){
    case "small":
        if (typeof items === 'number') w = await tModule.infoWidget(items, wSize, uCheck.needUpdate)
        else w = await smallWidget()
      break;
    case "medium":
        if (typeof items === 'number' || uCheck.needUpdate) w = await tModule.infoWidget(items, uCheck)
        else w = await mediumWidget(viewType)
      break;
    case "large":
        if (typeof items === 'number' || uCheck.needUpdate) w = await tModule.infoWidget(items, uCheck)
        else w = await largeWidget(viewType)
      break;
    case "extraLarge":
        if (typeof items === 'number' || uCheck.needUpdate) w = await tModule.infoWidget(items, uCheck)
        else w = await extraLargeWidget(viewType)
      break;
    case "accessoryCircular": 
        if (typeof items === 'number' || uCheck.needUpdate) w = await tModule.infoWidget(items, uCheck)
        else w = await circularWidget()
      break;
    case "accessoryRectangular":
        if (typeof items === 'number' || uCheck.needUpdate) w = await tModule.infoWidget(items, uCheck)
        else w = await rectangularWidget()
      break;
    default: w = await tModule.infoWidget(items, uCheck.needUpdate)
    }
  Script.setWidget(w)
} else if (config.runsInNotification){
    QuickLook.present(await tModule.getImage(nPar.userInfo.thumbnail))
};


//---- CREATE CIRCULAR LOCKSCREENWIDGET ----
async function circularWidget(){
  let w = Object.assign(new ListWidget(), { url: 'scriptable:///run/tagesschau', refreshAfterDate: new Date(Date.now() + 1000 * 60 * CONFIGS.DEVICES[Device.model()].refreshInt) });
      //w.addAccessoryWidgetBackground = true
      
  let i = w.addImage(await tModule.getImage('tagesschau_trademark_monochrLS'))
      i.tintColor = Color.white()
      i.imageSize = new Size(45, 45)
      i.centerAlignImage()
      
  return w
};


//---- CREATE RECTANGULAR LOCKSCREENWIDGET ----
async function rectangularWidget(){
    let w = Object.assign(new ListWidget(), {url: shareURL, refreshAfterDate: new Date(Date.now()+1000*60*CONFIGS.DEVICES[Device.model()].refreshInt) });
        w.setPadding(0, 0, 0, 0)
        //w.addAccessoryWidgetBackground = true
        
    let bgStack = w.addStack()
        bgStack.layoutVertically()
        bgStack.size = new Size(154, 68)
        bgStack.setPadding(1, 5, 1, 5)
        bgStack.cornerRadius = 10
        bgStack.backgroundColor = new Color('000000', 0.9)
        bgStack.borderColor = Color.white()
        bgStack.borderWidth = 2
    
    let headerStack = bgStack.addStack()
        headerStack.spacing = 4
        headerStack.centerAlignContent()

    let headerImg = headerStack.addImage(await tModule.getImage('tagesschau_trademark_monochrLS'))
        headerImg.imageSize = new Size(10, 10)
        headerImg.tintColor = Color.white()
        
    let headerTxt = headerStack.addText("tagesschau " + feedtype.charAt(0).toUpperCase() + feedtype.slice(1))
        headerTxt.font = Font.boldRoundedSystemFont(11)
    
        bgStack.addSpacer(1)
    
    let artTitle = bgStack.addText(breakingNews + items[0].title.replaceAll('+', '').trim())
        artTitle.font = Font.semiboldSystemFont(10)
        artTitle.minimumScaleFactor = 0.6
        artTitle.lineLimit = 2
        
        bgStack.addSpacer(0.5)
    
    let artFirstSentence = bgStack.addText(items[0].firstSentence)
        artFirstSentence.font = Font.regularSystemFont(10)
        artFirstSentence.minimumScaleFactor = 0.5
        artFirstSentence.lineLimit = 3
    
        bgStack.addSpacer(0.5)
        
        df.dateFormat = 'dd. MMM HH:mm'
    let artFooter = bgStack.addText(ressort.toUpperCase() + " • " + df.string(new Date(items[0].date)) + " Uhr")
        artFooter.font = Font.italicSystemFont(6)
        artFooter.lineLimit = 1
        artFooter.textOpacity = 0.7
    
    return w
};


//--------- CREATE SMALL WIDGET ---------
async function smallWidget(){
  let w = new ListWidget()
      w.url = shareURL
      w.refreshAfterDate = new Date(Date.now() + 1000*60* CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundImage = await tModule.getImage(await tModule.getHighestImage(items, 0, '1x1') ?? 'tagesschauBackground05')
      w.setPadding(5, 5, 6, 3)
  
      await tModule.createHeader('fullscreen', w, feedtype)

  let articleInfo = w.addStack()
      articleInfo.centerAlignContent()
      articleInfo.layoutVertically();
      
  let firstLine = articleInfo.addStack()
      firstLine.centerAlignContent()

  let articleRessort = firstLine.addText(ressort.toUpperCase())
      articleRessort.textColor = Color.orange()
      articleRessort.font = new Font('HelveticaNeue-CondensedBold', 9)
      articleRessort.shadowColor = Color.black()
      articleRessort.shadowOffset = new Point(2, 1)
      articleRessort.shadowRadius = 1
      
      df.dateFormat = 'dd.MMM HH:mm'
  let articleDate = firstLine.addText(' • ' + df.string(new Date(items[0].date))+' Uhr')
      articleDate.font = Font.italicSystemFont(8)
      articleDate.textOpacity = 1
      articleDate.textColor = Color.white()
      articleDate.shadowColor = Color.black()
      articleDate.shadowOffset = new Point(2, 1)
      articleDate.shadowRadius = 1
      firstLine.addSpacer()
      
  let articleTitle = articleInfo.addText(breakingNews + items[0].title.replaceAll('+', '').trim())
      articleTitle.textColor = Color.white()
      articleTitle.font = new Font('HelveticaNeue-CondensedBold', 14)//Font.boldSystemFont(14)
      articleTitle.minimumScaleFactor = 0.4
      articleTitle.shadowColor = Color.black()
      articleTitle.shadowOffset = new Point(2, 2)
      articleTitle.shadowRadius = 1
      
return w
};


//--------- CREATE MEDIUM DETAIL WIDGET ---------
async function mediumWidget(view){
  let w = new ListWidget()
      w.refreshAfterDate = new Date(Date.now()+1000*60*CONFIGS.DEVICES[Device.model()].refreshInt)
      w.setPadding(7, 10, 4, 9)
      w.backgroundImage = await tModule.getImage(background)
      
      await tModule.createHeader(view, w, feedtype)
      
  if (view==='detailview'){
      await tModule.createArticleList(items, w, 0, false, true)
      w.addSpacer()
  } else if (view==='fullscreen'){
      w.setPadding(5, 0, 0, 0)
      w.backgroundImage = await tModule.getImage(await tModule.getHighestImage(items, 0, '16x9') ?? 'tagesschauBackground')
      await tModule.createFullscreen(w, items)
  } else {
      for (i=0; i<2; i++) await tModule.createArticleList(items, w, i, true, false)
      w.addSpacer()
  }

return w
};


// --------- CREATE LARGE DETAIL WIDGET ---------
async function largeWidget(view){
  let w = new ListWidget()
      w.setPadding(10, 15, 5, 15)
      w.backgroundImage = await tModule.getImage(background)
      w.refreshAfterDate = new Date(Date.now() + 1000*60* CONFIGS.DEVICES[Device.model()].refreshInt)
      
      await tModule.createHeader(view, w, feedtype)
      
  if (view==='detailview'){
      w.addSpacer()
      await tModule.createArticleView(items, w)
      w.addSpacer()
  } else if (view==='fullscreen'){
      w.setPadding(5, 0, 0, 0)
      w.backgroundImage = await tModule.getImage(await tModule.getHighestImage(items, 0, '1x1') ?? background)
      await tModule.createFullscreen(w, items)
  } else {
      for (i=0; i<6; i++) await tModule.createArticleList(items, w, i, true, false)
      w.addSpacer()
  }
   
return w 
};
 

//--------- CREATE EXTRA LARGE DETAIL WIDGET ---------
//Extra large widgets are only supported on iPads running iOS 15 and later.
async function extraLargeWidget(view){
  let w = new ListWidget()
      w.setPadding(12, 15, 10, 15)
      w.backgroundImage = await tModule.getImage(background)
      w.refreshAfterDate = new Date(Date.now()+1000*60*CONFIGS.DEVICES[Device.model()].refreshInt)
      
      await tModule.createHeader(view, w, feedtype)
      
  let mainStack = w.addStack()
      mainStack.spacing = 7
      mainStack.centerAlignContent()
      
  let leftStack = mainStack.addStack()
      leftStack.layoutVertically()
      
  let rightStack = mainStack.addStack()
      rightStack.layoutVertically()
      
  if (view){
      await tModule.createArticleView(items, leftStack)
      for (i=1; i<7; i++) await tModule.createArticleList(items, rightStack, i, true, false)
      w.addSpacer(5)
  } else {
      for (i=0; i<5; i++) await tModule.createArticleList(items, leftStack, i, true, false)
      for (i=5; i<10; i++) await tModule.createArticleList(items, rightStack, i, true, false)
      w.addSpacer(0)
  }
      
return w
};


// CREATE TABLE 
async function createTable(f, i){
  let table = Object.assign(new UITable(), {showSeparators: true})
  let headerRow = Object.assign(new UITableRow(), {backgroundColor: Color.white(), isHeader: true, height: 50})
      
      iconCell = UITableCell.image(await tModule.getImage('appIconRounded'))
      iconCell.widthWeight = 3
      headerRow.addCell(iconCell)
      
      headerCell = UITableCell.image(await tModule.getImage('tagesschauHeader'))
      headerCell.widthWeight = 13
      headerRow.addCell(headerCell)
      
      buttonCell = UITableCell.button(f + " Feed↗")
      buttonCell.widthWeight = (Device.isPhone()) ? 12 : 22
      buttonCell.onTap = () => setFeed()
      headerRow.addCell(buttonCell)
      
      table.addRow(headerRow)
      plusIdx = 1

  if (uCheck.needUpdate){
      headerUpdate = Object.assign(new UITableRow(), {backgroundColor: Color.red(), isHeader: true, height: 45, textColor: Color.white()})
      headerUpdate.addText(`Version ${uCheck.uC.version} ist verfügbar`, "Starte das Script im In-App-Modus zum updaten")
      table.addRow(headerUpdate)
      plusIdx += 1
  }

  for (item of i){
    let row = new UITableRow()
        row.height = 120
        row.cellSpacing = 10
        row.onSelect = async (idx) => {
          item = i[idx-plusIdx]
          log(item)
          if (f === 'Video' && item?.streams?.h264xl != undefined) await tModule.createVideoView(item.streams.h264xl ?? item.tracking[1].c5.split(',')[1])
          else if (f === 'Video' && item?.streams?.h264xl == undefined) Safari.openInApp(item.streams.h264xl ?? item.tracking[1].c5.split(',')[1], false)
          else if (f === 'News' || 'Regional') Safari.openInApp(item.shareURL, false)
          }
        row.dismissOnSelect = false
     
    if (item.breakingNews == true){breakingNews = "⚡️"; row.backgroundColor = new Color('#ede4a680')}
    else breakingNews = ""
    
        ressort = (item.ressort == undefined) ? ressort = "Sonstiges" : ressort = item.ressort
        
        title = (item.title === '') ? 'tageschau24 Stream' : item.title

        imageCell = (item.teaserImage == undefined) ? row.addImage(await tModule.getImage('placeholderThumbnail')) : row.addImageAtURL(item.teaserImage.imageVariants["16x9-256"])
        imageCell.widthWeight = 4
   
    if (f === 'Video') titleCell = row.addText(`${title}`, `${df.string(new Date(item.date))}`)
    else if (f == 'News' || 'Regional') titleCell = row.addText(`${breakingNews}${item.title.replaceAll('+', '').trim()}`, `${item.firstSentence}\n${ressort.toUpperCase()} | ${df.string(new Date(item.date))} Uhr`)
        
        titleCell.widthWeight = (Device.isPhone()) ? 9 : 9
        
        table.addRow(row)
  }

    let creditFooter = Object.assign(new UITableRow(), {height: 40, cellSpacing: 7})
  
    let creditFooterCellImg = UITableCell.imageAtURL('https://cdn-icons-png.flaticon.com/512/25/25231.png')
        creditFooterCellImg.widthWeight = 1
  
    let creditFooterCellbutton = UITableCell.button("Created by iamrbn - Show on GitHub↗")
        creditFooterCellbutton.widthWeight = 15
        creditFooterCellbutton.onTap = () => Safari.openInApp("https://github.com/iamrbn/tagesschau-widget", false)
   
        creditFooter.addCell(creditFooterCellImg)
        creditFooter.addCell(creditFooterCellbutton)
        table.addRow(creditFooter)
        
 return QuickLook.present(table)
};


async function setFeed(){
  let a = new Alert()
      a.title = 'FEED INHALT WÄHLEN'
      a.addAction('News')
      a.addAction('Regional')
      a.addAction('Video')
      i = await a.present()
  if (i === 0){
      feedName = 'News'
      items = await tModule.getFromAPI(feedName.toLowerCase(), bundesland)
  } else if (i === 1){
      feedName = 'Regional'
      items = await tModule.getFromAPI(feedName.toLowerCase(), bundesland)
  } else if (i === 2){
      feedName = 'Video'
      items = await tModule.getVideosFromAPI(CONFIGS, null)
  }
  
  await createTable(feedName, items)
};


//Loads javascript module if needed
async function loadModule(){
  try {
     moduleFile = await new Request('https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/tagesschauModule.js').loadString()
     fm.writeString(modulePath, moduleFile)
     console.warn('>> loaded module file from github!')
  } catch(err){
     throw `loading module file from github repo\n${err.message}`
  }
};


//============ END OF SCRIPT ============\\
//=======================================\\
