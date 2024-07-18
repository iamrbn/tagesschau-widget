
//=========================================//
//============ START OF MODULE ============//
//=============== Version 0.9 =============//


//Loads Images from web
module.exports.loadImage = async (url) => {
    let img;
    try {
        img = await new Request(url).loadImage()
    } catch(error) {
        img = await getImageFor('Eilmeldung_NoThumbnailFound')
    }
  //return await new Request(url).loadImage()
    return img
};


//Saves Images from web
module.exports.saveImages = async () => {
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


//Loads Images from iCloud
module.exports.getImageFor = async (name) => {
  imgPath = fm.joinPath(dir, name + ".png")
  await fm.downloadFileFromiCloud(imgPath)
  img = await fm.readImage(imgPath)
 return img;
};


//Checks if's there an server update on GitHub available
module.exports.updateCheck = async (fm, modulePath, version) => {
   url = 'https://raw.githubusercontent.com/iamrbn/tagesschau-widget/main/tagesschau-widget.js'
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


//=========================================//
//============= END OF MODULE =============//
//=========================================//
