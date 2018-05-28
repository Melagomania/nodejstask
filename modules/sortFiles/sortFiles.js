function sortFiles(files) {
  let sortedFiles = {
    javascript: [],
    typescript: [],
    definition: [],
    configuration: [],
    images: [],
    logs: {length: 0},
    other: []

  };

  files.forEach(file => {
    let ext = file.match(/(\.[a-z])*\.[a-z]+$/)[0].replace(/\./, '');
    switch (ext) {
      case 'js':
      case 'jsx': {
        let fileObj = {
          path: file
        };
        sortedFiles.javascript.push(fileObj);
        break;
      }
      case 'ts':
      case 'tsx': {
        let fileObj = {
          path: file
        };
        sortedFiles.typescript.push(fileObj);
        break;
      }
      case 'd.ts': {
        let fileObj = {
          path: file
        };
        sortedFiles.definition.push(fileObj);
        break;
      }
      case 'json':
      case 'yaml':
      case 'yml': {
        let fileObj = {
          path: file
        };
        sortedFiles.configuration.push(fileObj);
        break;
      }
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'svg':
      case 'gif': {
        let fileObj = {
          additionalInfo: {}
        };
        fileObj.path = file;
        let scale = file.match(/-x\d(?=\.\w{3,4})/i);
        if(scale) {
          fileObj.additionalInfo.scale = scale[0].replace(/-x/i, '');
        }
        sortedFiles.images.push(fileObj);
        break;
      }
      case 'log': {
        if(file.match(/logs\/\d{8}\//)) {
          let fileObj = {
            additionalInfo: {}
          };
          let date = file.match(/\d{8}/)[0].slice(0, 4) + '-' + file.match(/\d{8}/)[0].slice(4, 6);
          let stream = file.match(/stderr|stdout(?=\.log)/i);
          fileObj.path = file;
          if(stream) {
            fileObj.additionalInfo.stream = stream[0];
          }
          if(sortedFiles.logs.dates) {
            if(sortedFiles.logs.dates[date]) {
              sortedFiles.logs.dates[date].push(fileObj);
              sortedFiles.logs.length++;
            } else {
              sortedFiles.logs.dates[date] = [];
              sortedFiles.logs.dates[date].push(fileObj);
              sortedFiles.logs.length++;
            }
          } else {
            sortedFiles.logs.dates = {};
            sortedFiles.logs.dates[date] = [];
            sortedFiles.logs.dates[date].push(fileObj);
            sortedFiles.logs.length++;
          }
        } else {
          let fileObj = {
            path: file
          };
          sortedFiles.other.push(fileObj);
        }
        break;
      }
      default: {
        let fileObj = {
          path: file
        };
        sortedFiles.other.push(fileObj);
      }
    }
  });
  return sortedFiles;
}

module.exports = sortFiles;

