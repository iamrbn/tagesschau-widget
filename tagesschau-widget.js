
// created by iamrbn → https://github.com/iamrbn/tagesschau-widget
// Inspitiert durch u/trbn_hck (mehr dazu in der GitHub Repo)

//==============================================
//!!!!!!!!!!! START OF CONFIG ZONE !!!!!!!!!!!!!

var feedType = 'news' //Standard Feed Typ eingeben 'news' oder 'regional' möglich
let refreshInt = 60 //Refresh Intervall der einzelnen Widgets in Minuten eingeben
let enableNotifications = true //true: Neue Pushnachrichten erlabut, ansonsten 'false'
let tagesschau100sec = false //true für Push-Notifications bei neuer Folge

//!!!!!!!!!!!! END OF CONFIG ZONE !!!!!!!!!!!!!!!/
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
let df = new DateFormatter()
    df.dateFormat = 'dd.MM.yy, HH:mm'
let scriptVersion = '1.3.1'
let scriptURL = 'https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/tagesschau-widget.js'
let endPoint = 'homepage'
await saveImages()
 
 if (wParameter == null) feedType
 else if (wParameter.includes("Regional")) feedType = "regional"
 else if (wParameter.includes("News")) feedType = "news"
  
async function getFromAPI(feedRessort, apiEndpoint) {
  let items;
  try {
    items = await new Request(`https://www.tagesschau.de/api2/${apiEndpoint}/`).loadJSON()
} catch (err) {
    log(err);
    errorWidget = await createErrorWidget();
    if (config.runsInApp) await errorWidget.presentMedium();
    else if (config.runsInWidget) Script.setWidget(errorWidget);
    Script.complete();
  };
  return items[feedRessort]
};

    items = await getFromAPI(feedType, endPoint);
    channels = await getFromAPI('channels', 'channels');
    video = channels.find(element => element.title == 'tagesschau in 100 Sekunden');

    shareURL = items[0].shareURL;
    breakingNews = (items[0].breakingNews === true) ? '⚡️ ' : '';
    ressort = (items[0].ressort == undefined) ? 'Sonstiges' : items[0].ressort;

if (!nKey.contains("current_title_idx0")) nKey.set("current_title_idx0", items[0].title);
if (!nKey.contains("current_podcast")) nKey.set("current_podcast", video.tracking[0].pdt);
if (nKey.get("current_title_idx0") != items[0].title && enableNotifications) notificationScheduler();
if (nKey.get("current_podcast") != video.tracking[0].pdt && tagesschau100sec) notificationSchedulerVid()


if (config.runsInApp) {
  QuickLook.present(await createTable());
} else if (config.runsInWidget) {
  switch (widgetSize) {
    case "small": widget = await createSmallWidget();
      break;
    case "medium": widget = await createMediumWidget();
        if(wParameter.includes("detailview")) widget = await createMediumDetailWidget();
       else widget = await createMediumWidget();
      break;
    case "large": widget = await createLargeWidget();
        if(wParameter.includes("detailview")) widget = await createLargeDetailWidget();
       else widget = await createLargeWidget();
      break;
    case "extraLarge": widget = await createExtraLargeWidget();
        if(wParameter.includes("detailview")) widget = await createExtralargeDetailWidget();
       else widget = await createExtraLargeWidget();
      break;
    case "accessoryRectangular": widget = await createMediumLSW();
      break;
    default: widget = await createMediumWidget();
    }
  Script.setWidget(widget);
} else if (config.runsInNotification) {
    attatchmend = (nParameter.userInfo.url === null) ? await getImageFor("Eilmeldung_NoThumbnailFound") : nParameter.userInfo.url;
    QuickLook.present(attatchmend)
};

async function createMediumLSW(){
    let w = new ListWidget()
    //w.addAccessoryWidgetBackground = true
    w.setPadding(0, 0, 0, 0)
    w.url = shareURL
    w.refreshAfterDate = new Date(Date.now() + 1000*60* refreshInt);

	let headerStack = w.addStack()
    headerStack.spacing = 3
    headerStack.centerAlignContent()
    
    let sf = SFSymbol.named("globe.europe.africa.fill")
    sf.applyUltraLightWeight()
    let headerImg = headerStack.addImage(sf.image)
    headerImg.imageSize = new Size(10, 10)
    headerImg.tintColor = Color.white();
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
}

//--------- CREATE SMALL WIDGET ---------
async function createSmallWidget() {
  let widget = new ListWidget();
      widget.setPadding(7, 7, 7, 4);
      widget.url = shareURL;
      widget.refreshAfterDate = new Date(Date.now() + 1000*60* refreshInt);

      widget.backgroundImage = (items[0].teaserImage == undefined) ?await getImageFor("background") : await loadImage(items[0].teaserImage.imageVariants["16x9-1920"]);
      
  let headerImage = widget.addImage(await getImageFor('appIconRounded'));
      headerImage.imageSize = new Size(27, 27);
      headerImage.cornerRadius = 13;
    
  let uCheck = await updateCheck(scriptVersion);
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available\nRun Script in App to update`);
      updateInfo.font = Font.semiboldSystemFont(10);
      updateInfo.textColor = Color.red();
      updateInfo.shadowColor = Color.black();
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText();
};
  
      widget.addSpacer();

  let articleInfo = widget.addStack();
      articleInfo.bottomAlignContent()
      articleInfo.layoutVertically();

  let articleRessort = articleInfo.addText(ressort.toUpperCase())
      articleRessort.textColor = Color.orange();
      articleRessort.font = Font.semiboldSystemFont(9);
      articleRessort.shadowColor = Color.black()
      articleRessort.shadowOffset = new Point(5, 5);
      articleRessort.shadowRadius = 3;

  let articleTitle = articleInfo.addText(breakingNews + items[0].title.replaceAll('+', '').trim());
      articleTitle.textColor = Color.white();
      articleTitle.font = Font.boldSystemFont(14);
      articleTitle.minimumScaleFactor = 0.4;
      articleTitle.shadowColor = Color.black()
      articleTitle.shadowOffset = new Point(2, 5);
      articleTitle.shadowRadius = 5;

  let articleDate = articleInfo.addText(df.string(new Date(items[0].date)) + " Uhr");
      articleDate.font = Font.italicSystemFont(8);
      articleDate.textOpacity = 0.7
      articleDate.textColor = Color.white()
      articleDate.shadowColor = Color.black()
      articleDate.shadowOffset = new Point(5, 5);
      articleDate.shadowRadius = 3;    

return widget
}

//--------- CREATE MEDIUM WIDGET ---------
async function createMediumWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 5, 10, 7);
      widget.refreshAfterDate = new Date(Date.now() + 1000*60* refreshInt);
      widget.backgroundImage = await getImageFor('background');
      
  let headerImage = widget.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(105, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
    
  let uCheck = await updateCheck(scriptVersion);
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Run Script in App to update`);
      updateInfo.font = Font.semiboldSystemFont(11);
      updateInfo.textColor = Color.red();
      updateInfo.shadowColor = Color.black();
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText();
};
      
      widget.addSpacer(2);
        
  await createLargeArticleView(widget, 0);
  await createLargeArticleView(widget, 1);

return widget;
};


//--------- CREATE MEDIUM DETAIL WIDGET ---------
async function createMediumDetailWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 7, 10, 7);
      widget.refreshAfterDate = new Date(Date.now()+1000*60*refreshInt);
      widget.backgroundImage = await getImageFor('background');
      
  let headerImage = widget.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(105, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
    
  let uCheck = await updateCheck(scriptVersion);
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Run Script in App to update`);
      updateInfo.font = Font.semiboldSystemFont(11);
      updateInfo.textColor = Color.red();
      updateInfo.shadowColor = Color.black();
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText();
};
      
      widget.addSpacer()
    
  let mainStack = widget.addStack()
      mainStack.size = new Size(315, 105)
      mainStack.topAlignContent()
  
  let articleImage = (items[0].teaserImage == undefined) ? mainStack.addImage(await getImageFor("Eilmeldung_NoThumbnailFound")) : mainStack.addImage(await loadImage(items[0].teaserImage.imageVariants["16x9-1920"]));
      articleImage.cornerRadius = 15
      articleImage.imageSize = new Size(160, 90)
      articleImage.url = shareURL;
      articleImage.applyFillingContentMode;
      
      mainStack.addSpacer(4)
      
  let articleInfo = mainStack.addStack();
      articleInfo.layoutVertically()
      articleInfo.size = new Size(144, 105)

  let articleRessort = articleInfo.addText(ressort.toUpperCase()+" ↗")
      articleRessort.textColor = Color.orange();
      articleRessort.font = Font.semiboldMonospacedSystemFont(10);
      articleRessort.url = "https://tagesschau.de/"+ressort

  let articleTitle = articleInfo.addText(breakingNews + items[0].title.replaceAll('+', '').trim());
      articleTitle.textColor = Color.white();
      articleTitle.font = Font.headline();
      articleTitle.minimumScaleFactor = 0.5;
      
  let artFirstSentence = articleInfo.addText(items[0].firstSentence)
      artFirstSentence.font = Font.regularSystemFont(13);
      artFirstSentence.minimumScaleFactor = 0.7
      artFirstSentence.textColor = Color.white()
      artFirstSentence.shadowColor = Color.black()
      artFirstSentence.lineLimit = 5
      artFirstSentence.shadowOffset = new Point(3, 3)
      artFirstSentence.shadowRadius = 5

  let articleDate = articleInfo.addText(df.string(new Date(items[0].date)) + " Uhr");
      articleDate.font = Font.italicSystemFont(8);
      articleDate.minimumScaleFactor = 0.8
      articleDate.textColor = Color.gray()
      
      widget.addSpacer()

return widget
};


// --------- CREATE LARGE WIDGET ---------
async function createLargeWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 10, 10, 10);
      widget.refreshAfterDate = new Date(Date.now()+1000*60*refreshInt);
      widget.backgroundImage = await getImageFor('background')
      
  let headerStack = widget.addStack()
      headerStack.centerAlignContent()
      headerStack.spacing = 10
      
  let iconImage = headerStack.addImage(await getImageFor('appIcon'));
      iconImage.imageSize = new Size(27, 27)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(145, 27);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
  
  let uCheck = await updateCheck(scriptVersion)
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Run Script in App to update`)
      updateInfo.font = Font.semiboldSystemFont(11)
      updateInfo.textColor = Color.red()
      updateInfo.shadowColor = Color.black()
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText()
};
  
   widget.addSpacer()

  await createLargeArticleView(widget, 0);
  await createLargeArticleView(widget, 1);
  await createLargeArticleView(widget, 2);
  await createLargeArticleView(widget, 3);
  await createLargeArticleView(widget, 4);
  await createLargeArticleView(widget, 5);

return widget
};


// --------- CREATE LARGE DETAIL WIDGET ---------
async function createLargeDetailWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 10, 5, 10);
      widget.refreshAfterDate = new Date(Date.now() + 1000*60* refreshInt);
      widget.backgroundImage = await getImageFor('background')
      
  let headerStack = widget.addStack()
      headerStack.bottomAlignContent()
      headerStack.spacing = 12
      
  let iconImage = headerStack.addImage(await getImageFor('appIcon'));
      iconImage.imageSize = new Size(25, 25)
      iconImage.cornerRadius = 7
      
  let headerImage = headerStack.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(120, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
    
  let uCheck = await updateCheck(scriptVersion);
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Run Script in App to update`);
      updateInfo.font = Font.semiboldSystemFont(11);
      updateInfo.textColor = Color.red();
      updateInfo.shadowColor = Color.black();
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText();
};
      
      widget.addSpacer(10);
      headerStack.addSpacer();
 
  let headerRessortStack = headerStack.addStack()
      headerRessortStack.setPadding(2, 6, 2, 6);
      headerRessortStack.cornerRadius = 7;
      headerRessortStack.bottomAlignContent();
      headerRessortStack.backgroundColor = new Color('#41414180');
      headerRessortStack.url = "https://tagesschau.de/"+ressort;
      
  let artRessort = headerRessortStack.addText(ressort.toUpperCase() + ' ↗');
      artRessort.font = Font.semiboldSystemFont(9);
      artRessort.textColor = Color.orange();
      
  let artTitle = widget.addText(breakingNews + items[0].title.replaceAll('+', '').trim());
      artTitle.font = Font.boldSystemFont(15);
      artTitle.lineLimit = 1;
      artTitle.minimumScaleFactor = 0.7;
      artTitle.textColor = Color.white();
      artTitle.shadowColor = Color.black();
      artTitle.shadowOffset = new Point(3, 3);
      artTitle.shadowRadius = 5;

  let artFirstSentence = widget.addText(items[0].firstSentence);
      artFirstSentence.font = Font.regularSystemFont(13);
      artFirstSentence.minimumScaleFactor = 0.7;
      artFirstSentence.textColor = Color.white();
      artFirstSentence.lineLimit = 2;
      artFirstSentence.shadowColor = Color.black();
      artFirstSentence.shadowOffset = new Point(3, 3);
      artFirstSentence.shadowRadius = 5;
       
      widget.addSpacer(4);
  
  let imageStack = widget.addStack();
      imageStack.size = new Size(307, 163);
      imageStack.cornerRadius = 15;
      imageStack.spacing = 10;
      
  let artImage = (items[0].teaserImage == undefined) ? imageStack.addImage(await getImageFor("Eilmeldung_NoThumbnailFound")) : imageStack.addImage(await loadImage(items[0].teaserImage.imageVariants["16x9-1920"]));
      artImage.applyFillingContentMode();
      artImage.url = items[0].shareURL;
    
      widget.addSpacer(3);
    
  let artContent = widget.addText(items[0].content[0].value.replace(/<[^>]*>/g, ''));
      artContent.font = Font.regularSystemFont(12);
      artContent.textColor = Color.white();
      artContent.minimumScaleFactor = 0.8;
   
      
  let artDate = widget.addText("Stand: " + df.string(new Date(items[0].date)) + " Uhr");
      artDate.font = Font.italicSystemFont(9)
      artDate.textColor = Color.gray()

return widget; 
};


//--------- CREATE EXTRA LARGE WIDGET ---------
//Extra large widgets are only supported on iPads running iOS 15 and newer.
async function createExtraLargeWidget() {
  let widget = new ListWidget();
      widget.setPadding(10, 10, 10, 13);
      widget.refreshAfterDate = new Date(Date.now() + 1000*60* refreshInt);
      widget.backgroundImage = await getImageFor('background');
      
  let headerStack = widget.addStack();
      headerStack.centerAlignContent();
      headerStack.setPadding(0, 245, 0, 0);
      headerStack.spacing = 9;
      
  let iconImage = headerStack.addImage(await getImageFor('appIcon'));
      iconImage.imageSize = new Size(27, 27);
      iconImage.cornerRadius = 7;
      
  let headerImage = headerStack.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(135, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
          
  let uCheck = await updateCheck(scriptVersion);
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Starte Script im in App Modus zum updaten`)
      updateInfo.font = Font.semiboldSystemFont(11);
      updateInfo.textColor = Color.red();
      updateInfo.shadowColor = Color.black();
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText();
};
      
      widget.addSpacer();
      
  let mainStack = widget.addStack();
      mainStack.spacing = 7;
  let leftStack = mainStack.addStack();
      leftStack.layoutVertically();
  let rightStack = mainStack.addStack();
      rightStack.layoutVertically();
          
  await createLargeArticleView(leftStack, 0);
  await createLargeArticleView(leftStack, 1);
  await createLargeArticleView(leftStack, 2);
  await createLargeArticleView(leftStack, 3);
  await createLargeArticleView(leftStack, 4);
  
  await createLargeArticleView(rightStack, 5);
  await createLargeArticleView(rightStack, 6);
  await createLargeArticleView(rightStack, 7);
  await createLargeArticleView(rightStack, 8);
  await createLargeArticleView(rightStack, 9);
  
  widget.addSpacer();
      
  return widget;
};


//--------- CREATE EXTRA LARGE DETAIL WIDGET ---------
//Extra large widgets are only supported on iPads running iOS 15 and newer.
async function createExtralargeDetailWidget() {
  let widget = new ListWidget();
      widget.setPadding(12, 15, 10, 15);
      widget.refreshAfterDate = new Date(Date.now()+1000*60*refreshInt);
      widget.backgroundImage = await getImageFor('background');
      
  let headerStack = widget.addStack();
      headerStack.bottomAlignContent();
      headerStack.setPadding(0, 245, 0, 0);
      headerStack.spacing = 9;
      
  let iconImage = headerStack.addImage(await getImageFor('appIcon'));
      iconImage.imageSize = new Size(27, 27);
      iconImage.cornerRadius = 7;
      
  let headerImage = headerStack.addImage(await getImageFor('header'));
      headerImage.imageSize = new Size(135, 25);
      headerImage.tintColor = Color.white();
      headerImage.centerAlignImage();
      headerImage.applyFillingContentMode();
          
  let uCheck = await updateCheck(scriptVersion);
  if (uCheck.version > scriptVersion) {
      updateInfo = widget.addText(`Version ${uCheck.version} is Available - Starte Script im in App Modus zum updaten`);
      updateInfo.font = Font.semiboldSystemFont(11);
      updateInfo.textColor = Color.red();
      updateInfo.shadowColor = Color.black();
      updateInfo.shadowOffset = new Point(2, 5);
      updateInfo.shadowRadius = 4;
      updateInfo.centerAlignText();
};
    
  let mainStack = widget.addStack();
      mainStack.spacing = 14;
      mainStack.centerAlignContent();
  let leftStack = mainStack.addStack();
      leftStack.layoutVertically();
      leftStack.cornerRadius = 10;
      leftStack.size = new Size(325, 300);
  let rightStack = mainStack.addStack();
      rightStack.layoutVertically();
          
  let headerRessortStack = leftStack.addStack();
      headerRessortStack.setPadding(4, 6, 4, 6);
      headerRessortStack.cornerRadius = 7;
      headerRessortStack.bottomAlignContent();
      headerRessortStack.url = "https://tagesschau.de/"+ressort;
      headerRessortStack.backgroundColor = new Color('#41414180');
      
  let artRessort = headerRessortStack.addText(ressort.toUpperCase() + " ↗");
      artRessort.font = Font.semiboldSystemFont(9);
      artRessort.textColor = Color.orange();
      
  let artTitle = leftStack.addText(breakingNews + items[0].title.replaceAll('+', '').trim());
      artTitle.font = Font.boldSystemFont(15);
      artTitle.textColor = Color.white();
      artTitle.shadowColor = Color.black();
      artTitle.lineLimit = 1;
      artTitle.minimumScaleFactor = 0.8;
      artTitle.shadowOffset = new Point(3, 3);
      artTitle.shadowRadius = 7;

  let artFirstSentence = leftStack.addText(items[0].firstSentence);
      artFirstSentence.font = Font.regularSystemFont(13);
      artFirstSentence.textColor = Color.white();
      artFirstSentence.minimumScaleFactor = 0.8;
      artFirstSentence.lineLimit = 2;
      artFirstSentence.shadowColor = Color.black();
      artFirstSentence.shadowOffset = new Point(3, 3);
      artFirstSentence.shadowRadius = 7;
      
      leftStack.addSpacer(2);
  
  let imageStack = leftStack.addStack();
      imageStack.size = new Size(320, 165);
      imageStack.cornerRadius = 20;
      imageStack.spacing = 10;
	
  let artImage = (items[0].teaserImage == undefined) ? imageStack.addImage(await getImageFor("Eilmeldung_NoThumbnailFound")) : imageStack.addImage(await loadImage(items[0].teaserImage.imageVariants["16x9-1920"]));

	   artImage.applyFillingContentMode();
  	   artImage.url = items[0].shareURL;
  
      leftStack.addSpacer(2)
    
  let artContent = leftStack.addText(items[0].content[0].value.replace(/<[^>]*>/g, ''))
      artContent.font = Font.regularSystemFont(12)
      artContent.textColor = Color.white()
      artContent.minimumScaleFactor = 0.8

  let articleDate = leftStack.addText("Stand: " + df.string(new Date(items[0].date)) + " Uhr");
      articleDate.font = Font.italicSystemFont(9)
      articleDate.textColor = Color.gray()
  
  //-------------------

  await createLargeArticleView(rightStack, 1);
  await createLargeArticleView(rightStack, 2);
  await createLargeArticleView(rightStack, 3);
  await createLargeArticleView(rightStack, 4);
  await createLargeArticleView(rightStack, 5);
  await createLargeArticleView(rightStack, 6);
  
      widget.addSpacer(5);
      
return widget;
}; 
    
async function createLargeArticleView(widget, apiIdx) {
  if (items[apiIdx] == undefined) apiIdx -= 1;

      widget.addSpacer(3)
  let main = widget.addStack()
      main.backgroundColor = new Color('#41414180')
      main.cornerRadius = 7
      main.spacing = 5
      main.url = items[apiIdx].shareURL
      
  let image = main.addStack();
         
  let article = main.addStack();
      article.layoutVertically();
      article.topAlignContent();
 
  let breakingNews = (items[apiIdx].breakingNews == true) ? '⚡️ ' : '';
  let img = (items[apiIdx].teaserImage == undefined) ? image.addImage(await getImageFor("Eilmeldung_NoThumbnailFound")) : image.addImage(await loadImage(items[apiIdx].teaserImage.imageVariants["16x9-1920"]));
      img.cornerRadius = 7 
      
      article.addSpacer(2);
      
  if (items[apiIdx].ressort == undefined) items[apiIdx].ressort = 'Sonstiges';
  
  let ressort = article.addText(items[apiIdx].ressort.toUpperCase());
      ressort.textColor = Color.orange();
      ressort.font = Font.semiboldMonospacedSystemFont(9);
      
  let title = article.addText(breakingNews + items[apiIdx].title.replaceAll('+', '').trim());
      title.textColor = Color.white();
      title.font = Font.boldMonospacedSystemFont(10);
      title.minimumScaleFactor = 0.5;
      
  let date = article.addText(df.string(new Date(items[apiIdx].date))+" Uhr");
      date.font = Font.italicSystemFont(8);
      date.textOpacity = 0.5;
      date.textColor = Color.white();
      
      main.addSpacer();
      widget.addSpacer(3);
};


async function createTable() {
 if (Device.isPad()) {
	 cellWidth = 22
    cellWidth2 = 9
	 rowWidth = 100
 } else if (Device.isPhone()) {
    cellWidth = 12
    cellWidth2 = 9
    rowWidth = 90
  };
  
  let nAlert = new Alert();
      nAlert.title = 'Ressort Auswählen';
      nAlert.addAction('News');
      nAlert.addAction('Regional');
      feedName = (await nAlert.present() == 0) ? "News" : "Regional";
  
  let table = new UITable();
      table.showSeparators = true
  
  let headerRow = new UITableRow()
      headerRow.backgroundColor = Color.white()
      headerRow.isHeader = true
      headerRow.height = 50
      
      iconCell = UITableCell.image(await getImageFor('appIconRounded'));
      iconCell.widthWeight = 3;
      headerRow.addCell(iconCell);
      
      headerCell = UITableCell.image(await getImageFor('header'));
      headerCell.widthWeight = 9;
      headerRow.addCell(headerCell);
      
      textCell = UITableCell.text(" " + feedName + " Feed");
      textCell.titleFont = Font.boldSystemFont(15);
      textCell.titleColor = new Color('#07184C');
      textCell.widthWeight = cellWidth;
      headerRow.addCell(textCell);

      table.addRow(headerRow)
      plusIdx = 1
      
    let uCheck = await updateCheck(scriptVersion);
    if (uCheck.version > scriptVersion) {    
      let headerUpdate = new UITableRow();
          headerUpdate.backgroundColor = Color.red()
          headerUpdate.isHeader = true
          headerUpdate.height = 45
      
          headerUpdate.addText(`Version ${uCheck.version} ist verfügbar`, "Starte das Script im in App Modus zum updaten");
          headerUpdate.textColor = Color.white();
          table.addRow(headerUpdate)
          plusIdx += 1
};
  
  for (item of await getFromAPI(feedName.toLowerCase(), endPoint)) {
    let row = new UITableRow();
        row.height = 120;
        row.cellSpacing = 10;
        row.onSelect = (idx) => {
          let item = items[idx-plusIdx];
          Safari.openInApp(item.shareURL, false);
          };
        row.dismissOnSelect = false;
     
     if (item.breakingNews == true) {breakingNews = "⚡️"; row.backgroundColor = new Color('#ede4a680')}
     else breakingNews = "";
    
        ressort = (item.ressort == undefined) ? ressort = "Sonstiges" : ressort = item.ressort;

        imageCell = (item.teaserImage == undefined) ? row.addImage(await getImageFor('Eilmeldung_NoThumbnailFound')) : row.addImageAtURL(item.teaserImage.imageVariants["16x9-1920"]);
        imageCell.widthWeight = 4;
    
    let titleCell = row.addText(`${breakingNews}${item.title.replaceAll('+', '').trim()}`, `${item.firstSentence}\n${ressort.toUpperCase()} | ${df.string(new Date(items[0].date))} Uhr`);
        titleCell.widthWeight = cellWidth2;
        
        table.addRow(row);
    };
    
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
    
 return table;
};

//-----

function createErrorWidget() {
  let bgGradient = new LinearGradient();
      bgGradient.locations = [0, 1];
      bgGradient.colors = [new Color('#2D65AE'), new Color('#19274C')];
  let errorWidget = new ListWidget();
      errorWidget.backgroundGradient = bgGradient;

  let title = errorWidget.addText('tagesschau');
      title.font = Font.headline();
      title.centerAlignText();

      errorWidget.addSpacer(10);

  let errTxt = errorWidget.addText('Es besteht keine Verbindung zum Internet');
      errTxt.font = Font.semiboldMonospacedSystemFont(16);
      errTxt.textColor = Color.red();

  let errTxt2 = errorWidget.addText('Dieses Widget benötigt eine Verbindung zum Internet um funktionieren zu können!');
      errTxt2.font = Font.regularRoundedSystemFont(14);
      errTxt2.textColor = Color.red();
      errTxt2.textOpacity = 0.8;

  return errorWidget;
};


//=======================================\\
//============ FUNCTION AREA ============\\
//=======================================\\

//Loads Images from web
async function loadImage(url) {
  return await new Request(url).loadImage();
};

//Saves Images from web
async function saveImages() {
  let imgs = {
background:"http://www.tagesschau.de/infoscreen/img/background-16-9-HD.png",
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

//Loads Images from iCloud
async function getImageFor(name) {
  imgPath = fm.joinPath(dir, name + ".png")
  await fm.downloadFileFromiCloud(imgPath)
  img = await fm.readImage(imgPath)
 return img;
};

function notificationSchedulerVid() {
    var nHeight = 315
    if (Device.isPad()) nHeight = 315
  let n = new Notification();
      n.title = video.title;
      n.body = 'vom ' + df.string(new Date(video.date)) + ' Uhr';
      n.addAction("Video im Browser Öffnen ▶︎", video.streams.podcastvideom)
      n.identifier = video.externalId;
      n.preferredContentHeight = nHeight
      n.deliveryDate = new Date(video.date)
      n.threadIdentifier = Script.name();
      n.scriptName = Script.name();
      n.userInfo = {"url":video.streams.podcastvideom};
      n.schedule();
    
 nKey.set("current_podcast", video.tracking[0].pdt);
};

//Create Notifications
function notificationScheduler(){
 var nHeight = 211;
 if (Device.isPad()) nHeight = 315;
 let imgURLStr = (items[0].teaserImage == undefined) ? null : items[0].teaserImage.imageVariants["16x9-1920"]
 let n = new Notification();
     n.subtitle = items[0].title;
     n.title = ressort.toUpperCase()+' | '+df.string(new Date(items[0].date)) + ' Uhr';
     n.body = `${items[0].content[0].value.replace(/<[^>]*>/g, '')}`
     n.addAction("Artikel Öffnen ↗", items[0].shareURL);
     n.identifier = items[0].sophoraId;
     n.userInfo = {"url":imgURLStr};
     n.threadIdentifier = Script.name();
     n.preferredContentHeight = nHeight//211;
     n.openURL = items[0].shareURL;
     n.scriptName = Script.name();
     n.schedule();
    
 nKey.set("current_title_idx0", items[0].title);
};

//Checks if's there an server update on GitHub available
async function updateCheck(version) {
  let uC;
 try {
  let updateCheck = new Request(`${scriptURL}on`)
      uC = await updateCheck.loadJSON()
 } catch (e) {return log(e)}
  
  log(uC);
  
  let needUpdate = false
  if (uC.version != version) {
      needUpdate = true
      console.warn(`Server Version ${uC.version} Verfügbar!`)
    if (!config.runsInWidget) {
      let newAlert = new Alert()
          newAlert.title = `Server Version ${uC.version} Verfügbar!`
          newAlert.addAction("OK")
          newAlert.addDestructiveAction("Später")
          newAlert.message="Änderungen:\n" + uC.notes + "\n\nOK klicken für den Download von GitHub\n Mehr Infos zum Update siehe Github Repo"
      if (await newAlert.present() == 0) {
        let req = new Request(scriptURL)
        let updatedCode = await req.loadString()
        let fm = FileManager.iCloud()
        let path = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`)
        log(path)
        fm.writeString(path, updatedCode)
        throw new Error("Update Komplett!")
      }
    }
  } else {log("up to date")}

  return needUpdate, uC;
};

//=======================================\\
//============ END OF SCRIPT ============\\
//=======================================\\
