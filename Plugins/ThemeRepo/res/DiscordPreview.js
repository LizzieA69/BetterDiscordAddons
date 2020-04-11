(_ => {
	let DiscordClassModules, DiscordClasses, userId;
	
	window.global = window;

	window.onload = function () {
		window.parent.postMessage({
			origin: "DiscordPreview",
			reason: "OnLoad"
		}, "*");
	};
	window.onkeyup = function (e) {
		window.parent.postMessage({
			origin: "DiscordPreview",
			reason: "KeyUp",
			which: e.which
		} ,"*");
	};
	window.onmessage = function (e) {
		if (typeof e.data === "object" && (e.data.origin == "PluginRepo" || e.data.origin == "ThemeRepo")) {
			switch (e.data.reason) {
				case "OnLoad":
					document.body.innerHTML = document.body.innerHTML.replace(/\t|\n|\r/g, "");
					
					if (e.data.username) {
						document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERNAMESMALL/gi, e.data.username.toLowerCase());
						document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERNAME/gi, e.data.username);
					}
					if (e.data.id) {
						userId = e.data.id;
						document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERID/gi, e.data.id);
					}
					if (e.data.avatar) document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_AVATAR/gi, e.data.avatar.split('"').join('') + "?size=");
					if (e.data.discriminator) document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_DISCRIMINATOR/gi, e.data.discriminator);
					if (e.data.classes) DiscordClasses = JSON.parse(e.data.classes);
					if (e.data.classmodules) DiscordClassModules = JSON.parse(e.data.classmodules);
					
					if (disCN != undefined && DiscordClasses != undefined && DiscordClassModules != undefined) {
						var oldHTML = document.body.innerHTML.split("REPLACE_CLASS_");
						var newHTML = oldHTML.shift();
						for (let html of oldHTML) {
							let reg = /([A-z0-9_]+)(.+)/.exec(html);
							newHTML += disCN[reg[1]] + reg[2];
						}
						document.body.innerHTML = newHTML;
					}
					
					if (e.data.nativecss) {
						var theme = document.createElement("link");
						theme.classList.add(e.data.reason);
						theme.rel = "stylesheet";
						theme.href = e.data.nativecss;
						document.head.appendChild(theme);
					}
					
					if (e.data.html) document.documentElement.className = e.data.html;
					document.documentElement.classList.add("mouse-mode");
					document.documentElement.classList.add("full-motion");
					
					if (e.data.titlebar) document.querySelector(".preview-titlebar").outerHTML = e.data.titlebar;
					
					document.body.firstElementChild.style.removeProperty("display");
					break;
				case "Eval":
					window.evalResult = null;
					if (e.data.jsstring) window.eval(`(_ => {${e.data.jsstring}})()`);
					window.parent.postMessage({
						origin: "DiscordPreview",
						reason: "EvalResult",
						result: window.evalResult
					}, "*");
					break;
				case "NewTheme":
				case "CustomCSS":
				case "ThemeFixer":
					document.querySelectorAll("style." + e.data.reason).forEach(theme => theme.remove());
					if (e.data.checked) {
						var theme = document.createElement("style");
						theme.classList.add(e.data.reason);
						theme.innerText = e.data.css;
						document.head.appendChild(theme);
					}
					break;
				case "DarkLight":
					if (e.data.checked) document.body.innerHTML = document.body.innerHTML.replace(new RegExp(disCN.themedark, "g"), disCN.themelight);
					else document.body.innerHTML = document.body.innerHTML.replace(new RegExp(disCN.themelight, "g"), disCN.themedark);
					break;
				case "Normalize":
					var oldHTML = document.body.innerHTML.split('class="');
					var newHTML = oldHTML.shift();
					for (let html of oldHTML) {
						html = html.split('"');
						newHTML += 'class="' + (e.data.checked ? html[0].split(" ").map(n => n.replace(/([A-z0-9]+?)-([A-z0-9_-]{6})/g, "$1-$2 da-$1")).join(" ") : html[0].split(" ").filter(n => n.indexOf("da-") != 0).join(" ")) + '"' + html.slice(1).join('"');
					}
					document.body.innerHTML = newHTML;
					break;
			}
		}
	};
	
	let disCN = new Proxy({}, {
		get: function (list, item) {
			return getDiscordClass(item).replace('#', '');
		}
	});
	let getDiscordClass = function (item) {
		let className = "Preview_undefined";
		if (DiscordClasses === undefined || DiscordClassModules === undefined) return className;
		else if (DiscordClasses[item] === undefined) {
			if (userId == "278543574059057154") console.warn(`%c[Preview]%c`, 'color:#3a71c1; font-weight:700;', '', item + ' not found in DiscordClasses');
			return className;
		} 
		else if (!Array.isArray(DiscordClasses[item]) || DiscordClasses[item].length != 2) {
			if (userId == "278543574059057154") console.warn(`%c[Preview]%c`, 'color:#3a71c1; font-weight:700;', '', item + ' is not an Array of Length 2 in DiscordClasses');
			return className;
		}
		else if (DiscordClassModules[DiscordClasses[item][0]] === undefined) {
			if (userId == "278543574059057154") console.warn(`%c[Preview]%c`, 'color:#3a71c1; font-weight:700;', '', DiscordClasses[item][0] + ' not found in DiscordClassModules');
			return className;
		}
		else if (DiscordClassModules[DiscordClasses[item][0]][DiscordClasses[item][1]] === undefined) {
			if (userId == "278543574059057154") console.warn(`%c[Preview]%c`, 'color:#3a71c1; font-weight:700;', '', DiscordClasses[item][1] + ' not found in ' + DiscordClasses[item][0] + ' in DiscordClassModules');
			return className;
		}
		else return className = DiscordClassModules[DiscordClasses[item][0]][DiscordClasses[item][1]];
	};
	
	window.require = function () {
		return _ => {};
	};
	
	window.getString = function (obj) {
		let string = "";
		if (typeof obj == "string") string = obj;
		else if (obj && obj.props) {
			if (typeof obj.props.children == "string") string = obj.props.children;
			else if (Array.isArray(obj.props.children)) for (let c of obj.props.children) string += typeof c == "string" ? c : getString(c);
		}
		return string;
	};
	
	window.webpackJsonp = function () {
		return {
			default: {
				m: {},
				c: {}
			}
		};
	};
	let WebModulesFind = function (filter) {
		const id = "PluginRepo-WebModules";
		const req = typeof(window.webpackJsonp) == "function" ? window.webpackJsonp([], {[id]: (module, exports, req) => exports.default = req}, [id]).default : window.webpackJsonp.push([[], {[id]: (module, exports, req) => module.exports = req}, [[id]]]);
		delete req.m[id];
		delete req.c[id];
		for (let m in req.c) {
			if (req.c.hasOwnProperty(m)) {
				var module = req.c[m].exports;
				if (module && module.__esModule && module.default && filter(module.default)) return module.default;
				if (module && filter(module)) return module;
			}
		}
	};
	let WebModulesFindByProperties = function (properties) {
		properties = Array.isArray(properties) ? properties : Array.from(arguments);
		let module = WebModulesFind(module => properties.every(prop => module[prop] !== undefined));
		if (!module) {
			module = {};
			for (let property of properties) module[property] = property;
		}
		return module;
	};
	let WebModulesFindByName = function (name) {
		return WebModulesFind(module => module.displayName === name) || "";
	};
	
	if (!window.BDV2) {
		window.BDV2 = {};
		window.BDV2.react = window.React;
		window.BDV2.reactDom = window.ReactDOM;
		window.BDV2.WebpackModules = {};
		window.BDV2.WebpackModules.find = WebModulesFind;
		window.BDV2.WebpackModules.findByUniqueProperties = WebModulesFindByProperties;
		window.BDV2.WebpackModules.findByDisplayName = WebModulesFindByName;
	}
	if (!window.BdApi) {
		window.BdApi = {};
		window.BdApi.getData = _ => {return {};};
		window.BdApi.loadData = _ => {return {};};
		window.BdApi.saveData = _ => {};
		window.BdApi.React = window.React;
		window.BdApi.ReactDOM = window.ReactDOM;
		window.BdApi.findModule = WebModulesFind;
		window.BdApi.findModuleByProps = WebModulesFindByProperties;
		window.BdApi.findModuleByDisplayName = WebModulesFindByName;
	}
})();