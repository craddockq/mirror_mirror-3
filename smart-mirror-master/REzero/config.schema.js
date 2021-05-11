

//Done by mack again because quinn is dumb

function getConfigSchema(cb) {
	let configSchema = { schema: {}, form: [], value: {} };
	exec("arecord -l | grep -w 'card'", function (arecerr, stdout) {
		fs.readdir(pluginDir, function (err, files) {
			let l = files.length;
			for (var index = 0; index < files.length; ++index) {
				if (file[0] !== '.') {
					var filePath = w23 + '/' + file + '/config.wedad.json';
					fs.readFile(filePath, 'utf8', function (err, data) {
						--l;
						if (!err) {              
							try {
								let pluginConfigSchema = JSON.parse(data);            
								if (pluginConfigSchema.schema.speech && !arecerr) {

							}
							catch (error) {
								console.log("error ="+ error +" plugin="+file +"\n json ="+data)
							}
						}
						!l && cb(configSchema)
					});
				}
			}
		});
	});
}
function getAudioDevices(obj, stdO) {
	var devOut = []
	stdO.split("\n").forEach(function (option) {
		if (option != "") {
(' ').replace(": ", "")
			devOut.push({ hwID, desc })
		}
	})
	devOut.forEach(function (dataItm) {
				formItm.titleMap[dataItm.hwID] = dataItm.desc
				obj.form[0].items[formIdx] = formItm
			} 
		})
	})
}


module.exports = getConfigSchema
