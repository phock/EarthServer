/**
 * @namespace Namespace for the Earth Server Generic Client
 */
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @ignore Just Inheritance Helper
 */
Function.prototype.inheritsFrom = function( parentClassOrObject )
{
    if ( parentClassOrObject.constructor == Function )
    {
        //Normal Inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else
    {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

/**
 * This function checks if this code is running is on a mobile platform.
 * @return true if mobile platform, false if not
 */
EarthServerGenericClient.isMobilePlatform = function ()
{
    var mobilePlatform = (function(a)
    {
        if(/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge|maemo|midp|mmp|opera m(ob|in)i|palm(os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows(ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|awa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r|s)|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp(i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac(|\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt(|\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg(g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-||o|v)|zz)|mt(50|p1|v)|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v)|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-|)|webc|whit|wi(g|nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
        {return true} else {return false}
    })(navigator.userAgent||window.opera);

    return mobilePlatform;
};

/**
 * @ignore Helper for Events
 */
EarthServerGenericClient.getEventTarget = function(e)
{
    e = e || window.event;
    return e.target || e.srcElement;
};

/**
 * @class SceneManager is the main class of the unified client.
 * All scene models are registered in this class with the add() function.
 * The createScene() function creates a x3dom scene with all scene models.
 */
EarthServerGenericClient.SceneManager = function()
{
    //Array of scene models
    this.models = new Array();
    this.baseElevation = new Array();
    this.currentUIElement = 0;

    /**
     * @default 1000 / 200 on a mobile platform
     * @type {Number}
     */
    var maxResolution = 1000;//Max Resolution per dimension (Standard PC)
    if( EarthServerGenericClient.isMobilePlatform())  //and for mobile Clients
        maxResolution = 200;

    /**
     * Returns the maximum resolution per dimension of a scene model.
     * This number depends on power templates (e.g. mobile device).
     * @return maximum Resolution
     */
    this.getMaxResolution = function()
    {   return maxResolution;   };

    /**
     * Adds any scene model to the scene.
     * @param model - any scene model.
     */
    this.addModel = function( model )
    {
        model.modelID = this.models.length;
        this.models.push(model);
    };

    this.setView =function(camID)
    {
        var cam = document.getElementById(camID);
        if(cam)
        {
            //If the user changes the camera, then moves around the camera has to be set to false to be able to bin again
            cam.setAttribute('set_bind','false');
            cam.setAttribute('set_bind','true');
        }
    };

    /**
     * Creates and returns the whole X3DOM Scene in the fishtank/cube with all added scene models.
     * The Sizes of the cube are aspected as aspect ratios with values between 0 and 1.
     * Example createScene("x3dom_div",1.0, 0.3, 0.5 ) Cube has 30% height and 50 depth compared to the width.
     * @param x3dID - ID of the x3d dom element
     * @param sceneID - ID of the scene elemenet
     * @param cubeSizeX - width of the cube
     * @param cubeSizeY - height of the cube
     * @param cubeSizeZ - depth of the cube
     */
    this.createScene = function(x3dID,sceneID, cubeSizeX, cubeSizeY, cubeSizeZ )
    {
        if( cubeSizeX <= 0 || cubeSizeX > 1.0) cubeSizeX = 1.0;
        if( cubeSizeY <= 0 || cubeSizeY > 1.0) cubeSizeY = 1.0;
        if( cubeSizeZ <= 0 || cubeSizeZ > 1.0) cubeSizeZ = 1.0;

        cubeSizeX = (parseFloat(cubeSizeX) * 1000);
        cubeSizeY = (parseFloat(cubeSizeY) * 1000);
        cubeSizeZ = (parseFloat(cubeSizeZ) * 1000);

        this.cubeSizeX = cubeSizeX;
        this.cubeSizeY = cubeSizeY;
        this.cubeSizeZ = cubeSizeZ;

        var x3d   = document.getElementById(x3dID);
        var scene = document.getElementById(sceneID);
        if( !scene)
        {
            alert("No X3D Scene found with id " + domElementID);
            return;
        }

        //Cameras
        var cam1 = document.createElement('Viewpoint');
        cam1.setAttribute("id","EarthServerGenericClient_Cam_Front");
        cam1.setAttribute("position", "0 0 " + this.cubeSizeZ*2);
        var cam2 = document.createElement('Viewpoint');
        cam2.setAttribute("id","EarthServerGenericClient_Cam_Top");
        cam2.setAttribute("position", "0 " + this.cubeSizeY*2 + " 0");
        cam2.setAttribute("orientation", "1.0 0.0 0.0 -1.55");
        var cam3 = document.createElement('Viewpoint');
        cam3.setAttribute("id","EarthServerGenericClient_Cam_Side");
        cam3.setAttribute("position", "" + -this.cubeSizeX*2+ " 0 0");
        cam3.setAttribute("orientation", "0 1 0 -1.55");
        scene.appendChild(cam1);
        scene.appendChild(cam2);
        scene.appendChild(cam3);

        var buttonTopView = document.createElement('button');
        buttonTopView.setAttribute("id","EarthServerGenericClient_Button_TopView");
        buttonTopView.setAttribute("class", "inside");
        buttonTopView.setAttribute("onclick", "EarthServerGenericClient_MainScene.setView('EarthServerGenericClient_Cam_Top');return false;");
        buttonTopView.innerHTML = "TopView";
        scene.appendChild(buttonTopView);
        var buttonFrontView = document.createElement('button');
        buttonFrontView.setAttribute("id","EarthServerGenericClient_Button_FrontView");
        buttonFrontView.setAttribute("class", "inside");
        buttonFrontView.setAttribute("onclick", "EarthServerGenericClient_MainScene.setView('EarthServerGenericClient_Cam_Front');return false;");
        buttonFrontView.innerHTML = "FrontView";
        scene.appendChild(buttonFrontView);
        var buttonSideView = document.createElement('button');
        buttonSideView.setAttribute("id","EarthServerGenericClient_Button_SideView");
        buttonSideView.setAttribute("class", "inside");
        buttonSideView.setAttribute("onclick", "EarthServerGenericClient_MainScene.setView('EarthServerGenericClient_Cam_Side');return false;");
        buttonSideView.innerHTML = "SideView";
        scene.appendChild(buttonSideView);

        var shape = document.createElement('Shape');
        var appearance = document.createElement('Appearance');
        var material = document.createElement('Material');
        material.setAttribute("emissiveColor","1 1 0");

        var lineset = document.createElement('IndexedLineSet');
        lineset.setAttribute("colorPerVertex", "false");
        lineset.setAttribute("coordIndex","0 1 2 3 0 -1 4 5 6 7 4 -1 0 4 -1 1 5 -1 2 6 -1 3 7 -1");

        var coords = document.createElement('Coordinate');
        coords.setAttribute("id", "cube");

        var cubeX = cubeSizeX/2.0;
        var cubeY = cubeSizeY/2.0;
        var cubeZ = cubeSizeZ/2.0;
        var cubeXNeg = -cubeSizeX/2.0;
        var cubeYNeg = -cubeSizeY/2.0;
        var cubeZNeg = -cubeSizeZ/2.0;

        var p = {};
        p[0] = ""+ cubeXNeg + " " + cubeYNeg + " " + cubeZNeg + " ";
        p[1] = ""+ cubeX + " " + cubeYNeg + " " + cubeZNeg + " ";
        p[2] = ""+ cubeX + " " + cubeY + " " + cubeZNeg + " ";
        p[3] = ""+ cubeXNeg + " " + cubeY + " " + cubeZNeg + " ";
        p[4] = ""+ cubeXNeg + " " + cubeYNeg + " " + cubeZ + " ";
        p[5] = ""+ cubeX + " " + cubeYNeg + " " + cubeZ + " ";
        p[6] = ""+ cubeX + " " + cubeY + " " + cubeZ + " ";
        p[7] = ""+ cubeXNeg + " " + cubeY + " " + cubeZ + " ";
        var points="";
        for(var i=0; i<8;i++)
        {   points = points+p[i];   }
        coords.setAttribute("point", points);

        lineset.appendChild(coords);
        appearance.appendChild(material);
        shape.appendChild(appearance);
        shape.appendChild(lineset);
        scene.appendChild(shape);

        var trans = document.createElement('Transform');
        trans.setAttribute("id", "trans");
        scene.appendChild(trans);

        this.setView('EarthServerGenericClient_Cam_Front');
        this.trans = trans;

    };

    /**
     * This function starts to load all models. You call this when the html is loaded or later on a click.
     */
    this.createModels = function()
    {
        console.time("create models");
        console.time("create models_0");
        console.time("create models_1");
        var i;
        for(i=0; i< this.models.length; i++)
        {
            this.models[i].createModel(this.trans, i,this.cubeSizeX,this.cubeSizeY,this.cubeSizeZ);
            console.timeEnd("create models_"+i);
        }
        console.timeEnd("create models");
    };

    /**
     * Update Offset changes the position of the current selected SceneModel on the x-,y- or z-Axis.
     * @param which - Which Axis will be changed (0:X 1:Y 2:Z)
     * @param value - The new position
     */
    this.updateOffset = function(which,value)
    {
        var trans = document.getElementById("EarthServerGenericClient_modelTransform"+this.currentUIElement);

        if( trans )
        {
            var offset;
            switch(which)
            {
                case 0: offset = this.cubeSizeX/2.0; break;
                case 1: offset = this.cubeSizeY/2.0; break;
                case 2: offset = this.cubeSizeZ/2.0; break;
            }
            var oldTrans = trans.getAttribute("translation");
            oldTrans = oldTrans.split(" ");
            oldTrans[which] = value - offset;
            //alert(oldTrans);
            trans.setAttribute("translation",oldTrans[0] + " " + oldTrans[1] + " " + oldTrans[2]);
        }
    };

    /**
     * This changes the scaling on the Y-Axis(Elevation).
     * @param value - The base elevation is multiplied by this value
     */
    this.updateElevation =function(value)
    {
        var trans = document.getElementById("EarthServerGenericClient_modelTransform"+this.currentUIElement);

        if( trans )
        {
            var oldTrans = trans.getAttribute("scale");
            oldTrans = oldTrans.split(" ");

            if( this.baseElevation[this.currentUIElement] === undefined)
            {
                this.baseElevation[this.currentUIElement] = oldTrans[1];
            }

            oldTrans[1] = value*this.baseElevation[this.currentUIElement]/10;

            trans.setAttribute("scale",oldTrans[0] + " " + oldTrans[1] + " " + oldTrans[2]);
        }
    };

    /**
     * Changes the transparency of the Scene Model.
     * @param value - New Transparency between 0-1 (Fully Opaque - Fully Transparent)
     */
    this.updateTransparency = function(value)
    {
        this.models[this.currentUIElement].updateTransparency(value);
    };

    /**
     * This creates the UI for the Scene.
     * @param domElementID - The dom element where to append the UI.
     */
    this.createUI = function(domElementID)
    {
        var mytable = document.createElement("table");
        var mytablebody = document.createElement("tbody");
        mytable.appendChild(mytablebody);

        var Element = document.getElementById(domElementID);
        if(Element)
        {   Element.appendChild(mytable);}
        else
        {   alert("Can't find DOM Element with ID: " + domElementID);   }


        var mycurrent_row=document.createElement("tr");
        mytablebody.appendChild(mycurrent_row);

        var mycurrent_cell = document.createElement("th");
        mycurrent_cell.innerHTML = "Modules";
        mycurrent_row.appendChild(mycurrent_cell);
        mycurrent_cell = document.createElement("th");
        mycurrent_cell.innerHTML = "Common";
        mycurrent_row.appendChild(mycurrent_cell);
        mycurrent_cell = document.createElement("th");
        mycurrent_cell.innerHTML = "Specific";
        mycurrent_row.appendChild(mycurrent_cell);


        //Cell 1: List with all modules
        mycurrent_row=document.createElement("tr");
        mycurrent_cell = document.createElement("td");
        var module_list = document.createElement("ul");
        module_list.setAttribute("id", "UI_ModuleList");
        module_list.onclick = function(event) {
            var target = EarthServerGenericClient.getEventTarget(event);
            var UIID = target.id;
            UIID = UIID.split(":");
            EarthServerGenericClient_MainScene.currentUIElement = UIID[2];

            //Set all style to none
            for (var i = 0; i < EarthServerGenericClient_MainScene.models.length; i++)
            {
                var div = document.getElementById("EarthServerGenericClient_SliderDiv_" +i);
                div.style.display = "none";
                div = document.getElementById("EarthServerGenericClient_SPECIFICDiv_" + i);
                div.style.display = "none";
            }
            //Set the chosen one to be shown
            var theDiv = document.getElementById("EarthServerGenericClient_SliderDiv_" + EarthServerGenericClient_MainScene.currentUIElement);
            theDiv.setAttribute("class", "active");
            theDiv.style.display = "block";
            theDiv = document.getElementById("EarthServerGenericClient_SPECIFICDiv_" + EarthServerGenericClient_MainScene.currentUIElement);
            theDiv.setAttribute("class", "active");
            theDiv.style.display = "block";

        };

        for (i = 0; i < this.models.length; i++)
        {
            var module = document.createElement("li");
            module.setAttribute("id", "EarthServerGenericClient:MODULE:"+i);
            module.innerHTML= this.models[i].name;
            module_list.appendChild(module);
        }

        mycurrent_cell.appendChild(module_list);
        mycurrent_row.appendChild(mycurrent_cell);
        mytablebody.appendChild(mycurrent_row);

        //Cell 2: Slider for the positioning X-Y-Z Axis
        mycurrent_cell = document.createElement("td");
        mycurrent_cell.setAttribute("id","EarthServerGenericClient_SliderCell");
        mycurrent_row.appendChild(mycurrent_cell);

        for (i = 0; i < this.models.length; i++)
        {
            var modelDiv = document.createElement("div");
            modelDiv.setAttribute("id","EarthServerGenericClient_SliderDiv_" + i);
            modelDiv.style.display = "none";
            mycurrent_cell.appendChild(modelDiv);

            EarthServerGenericClient.appendXYZASlider(modelDiv,i);
        }

        //Cell 4: Some specific stuff
        mycurrent_cell = document.createElement("td");
        mycurrent_cell.setAttribute("id","EarthServerGenericClient_SPECIFIC_Cell");
        mycurrent_row.appendChild(mycurrent_cell);

        for (var i = 0; i < this.models.length; i++)
        {
            var modelDiv = document.createElement("div");
            modelDiv.setAttribute("id","EarthServerGenericClient_SPECIFICDiv_" + i);
            modelDiv.style.display = "none";
            mycurrent_cell.appendChild(modelDiv);

            this.models[i].setSpecificElement(modelDiv,i);
        }

        //Make div 1 active
        var div1 = document.getElementById("EarthServerGenericClient_SliderDiv_0");
        div1.setAttribute("class", "active");
        div1.style.display = "block";
        div1 = document.getElementById("EarthServerGenericClient_SPECIFICDiv_0");
        div1.setAttribute("class", "active");
        div1.style.display = "block";
    }
};

/**
 * @class Abstract base class for scene models.
 */
EarthServerGenericClient.AbstractSceneModel = function(){
    /**
     * Sets the name of the scene model to be displayed.
     * @param modelName - Name of the model
     */
    this.setName = function(modelName){
        this.name = String(modelName);
    };
    /**
     * Sets the area of interest for the model. (Lower Corner, Upper Corner)
     * @param minx - Minimum/Lower Latitude
     * @param miny - Minimum/Lower Longitude
     * @param maxx - Maximum/Upper Latitude
     * @param maxy - Maximum/Upper Longitude
     */
    this.setAreaOfInterest = function(minx,miny,maxx,maxy){
        this.minx = minx;
        this.miny = miny;
        this.maxx = maxx;
        this.maxy = maxy;
    };
    /**
     * Sets the resolution of the scene model (if possible).
     * @param xRes - Resolution on the x-axis/Latitude
     * @param zRes - Resolution on the z-axis/Longitude
     */
    this.setResolution = function(xRes,zRes){
        this.XResolution = parseInt(xRes);
        this.ZResolution = parseInt(zRes);

        var maxResolution = EarthServerGenericClient_MainScene.getMaxResolution();
        if( this.XResolution > maxResolution )
        {   this.XResolution = maxResolution;   }
        if( this.ZResolution > maxResolution )
        {   this.ZResolution = maxResolution;   }

    };
    /**
     * Sets the names of the axes to be displayed [Not used yet]
     * @param xLabel - width
     * @param yLabel - height
     * @param zLabel - depth
     */
    this.setAxisLabels = function( xLabel, yLabel, zLabel){
        this.xLabel = String(xLabel);
        this.yLabel = String(yLabel);
        this.zLabel = String(zLabel);
    };
    /**
     * Sets the position of the scene model within the fishtank/cube. Values between [0-1]
     * @param xOffset - Offset on the x-axis/width  Default:0
     * @param yOffset - Offset on the y-axis/height Default:0
     * @param zOffset - Offset on the z-axis/depth  Default:0
     */
    this.setOffset = function( xOffset, yOffset, zOffset){
        this.xOffset = parseFloat(xOffset);
        this.yOffset = parseFloat(yOffset);
        this.zOffset = parseFloat(zOffset);
    };
    /**
     * Sets the size of the scene model compared to the fishtank/cube. Values between 0 - 1.
     * @param xScale - Size of the model on the x-axis/width  Default:1   (whole cube)
     * @param yScale - Size of the model on the y-axis/height Default:0.3 (30% of the cube)
     * @param zScale - Size of the model on the x-axis/width  Default:1   (whole cube)
     */
    this.setScale = function( xScale, yScale, zScale){
        this.xScale = parseFloat(xScale);
        this.yScale = parseFloat(yScale);
        this.zScale = parseFloat(zScale);
    };

    /**
     * Sets the image format for the server request.
     * @param imageFormat - Default "png"
     */
    this.setImageFormat = function( imageFormat){
        this.imageFormat = String(imageFormat);
    };

    /**
     * Sets the transparency of the scene model. Values between 0-1 (Fully Opaque - Fully Transparent).
     * @param transparency
     */
    this.setTransparency = function( transparency ){
        this.transparency = parseFloat(transparency);
    };

    /**
     * Creates the transform for the scene model to fit into the fishtank/cube. This is done automatically by
     * the scene model.
     * @param cubeSizeX - Size of the fishtank/cube on the x-axis
     * @param cubeSizeY - Size of the fishtank/cube on the y-axis
     * @param cubeSizeZ - Size of the fishtank/cube on the z-axis
     * @param XRes - Size of the received data on the x-axis (e.g. the requested DEM )
     * @param YRes - Size of the received data on the y-axis
     * @param ZRes - Size of the received data on the z-axis
     * @param minvalue - Minumum Value of the along the y-axis (e.g. minimum value in a DEM, so the model starts at it's wished location)
     * @return {Element}
     */
    this.createTransform = function(cubeSizeX,cubeSizeY,cubeSizeZ,XRes,YRes,ZRes,minvalue){
        var trans = document.createElement('Transform');
        trans.setAttribute("id", "EarthServerGenericClient_modelTransform"+this.modelID);
        var scaleX,scaleY,scaleZ;

        //console.log(XRes + "/" + YRes + "/" + ZRes);

        this.YResolution = YRes;

        scaleX = (cubeSizeX*this.xScale)/(parseInt(XRes)-1);
        scaleY = (cubeSizeY*this.yScale)/this.YResolution;
        scaleZ = (cubeSizeZ*this.zScale)/(ZRes-1);

        trans.setAttribute("scale", "" + scaleX + " " + scaleY + " " + scaleZ);

        var xoff = (cubeSizeX * this.xOffset) - (cubeSizeX/2.0);
        var yoff = (cubeSizeY * this.yOffset) - (minvalue*scaleY) - (cubeSizeY/2.0);
        var zoff = (cubeSizeZ * this.zOffset) - (cubeSizeZ/2.0);
        trans.setAttribute("translation", "" + xoff+ " " + yoff  + " " + zoff);

        return trans;
    };
    /**
     * Sets the default values. This is done automatically by the scene model.
     */
    this.setDefaults = function(){
        /**
         * Name of the model. This will be display in the UI.
         * @default "Name is given by the module"
         * @type {String}
         */
        this.name = "No name given";

        /**
         * Resolution for the latitude.
         * @default 500
         * @type {Number}
         */
        this.XResolution = 500;

        /**
         * Resolution for the longitude
         * @default 500
         * @type {Number}
         */
        this.ZResolution = 500;

        /**
         * Name of the X-Axis to be displayed.
         * @default "x"
         * @type {String}
         */
        this.xLabel = "x";

        /**
         * Name of the Y-Axis to be displayed.
         * @default "y"
         * @type {String}
         */
        this.yLabel = "y";

        /**
         * Name of the Z-Axis to be displayed.
         * @default "z"
         * @type {String}
         */
        this.zLabel = "z";

        /**
         * Offset on the X-Axis for the model.
         * @default 0
         * @type {Number}
         */
        this.xOffset = 0;

        /**
         * Offset on the Y-Axis for the model.
         * @default 0
         * @type {Number}
         */
        this.yOffset = 0;

        /**
         * Offset on the Z-Axis for the model.
         * @default 0
         * @type {Number}
         */
        this.zOffset = 0;

        /**
         * The models dimension compared to the whole cube on the X-Axis.
         * @default 1
         * @type {Number}
         */
        this.xScale = 1;

        /**
         * The models dimension compared to the whole cube on the Y-Axis.
         * @default 0.3
         * @type {Number}
         */
        this.yScale = 0.3;

        /**
         * The models dimension compared to the whole cube on the Z-Axis.
         * @default 1
         * @type {Number}
         */
        this.zScale = 1;

        /**
         * The used Image format (if one is used)
         * @default "png"
         * @type {String}
         */
        this.imageFormat = "png";

        /**
         * The Transparency of the model.
         * @default 0
         * @type {Number}
         */
        this.transparency = 0;
    };
};