const path = require('path');
const mockstarGenerators = require('mockstar-generators');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const urlParse = require('url-parse');

const utils = require('../utils');

module.exports = function (opts, callback) {
    inquirer
        .prompt([{
            type: 'list',
            name: 'mockerParentPath',
            message: '请选择 mocker 放置的根目录',
            choices: function () {
                let list = utils.getMockServerPathList(opts.cwd) || [];
                return list.map((item) => {
                    return {
                        name: path.relative(opts.cwd, item),
                        value: item
                    };
                });
            },
            validate: function (mockerParentPath) {
                if (!mockerParentPath) {
                    return 'mocker 放置的根目录不能为空';
                }

                return true;
            }
        }, {
            type: 'input',
            name: 'reqURL',
            message: '请输入CGI请求，例如： http://domain.com/a/b/c',
            validate: function (reqURL) {
                if (!reqURL) {
                    return '请输入CGI请求';
                }

                return true;
            }
        }, {
            type: 'input',
            name: 'mockerName',
            message: '请输入mocker名称，只能够输入英文、数字和、- 及 _ ',
            default: function (answers) {
                return utils.getMockerNameFromURL(answers.reqURL);
            },
            validate: function (mockerName, answers) {
                if (!mockerName) {
                    return 'mocker名称不能为空';
                }

                // 默认情况下是在当前路径下新建以 projectName 为名字的文件夹，然后再进入其中生成代码。
                // 但如果当前路径下已经存在了，则需要进行提示，避免覆盖
                if (!opts.isDev && fse.pathExistsSync(path.join(answers.mockerParentPath, mockerName))) {
                    return `当前目录下已经存在名字为 ${mockerName} 的文件夹了`;
                }

                return true;
            }
        }, {
            type: 'list',
            name: 'method',
            message: '请求类型',
            choices: ['get', 'post'],
            default: 'get'
        }, {
            type: 'confirm',
            name: 'isInitReadme',
            message: '是否初始化 README 文件',
            default: true
        }])
        .then(answers => {
            // console.log('--answers--', answers);

            const urlParseResult = urlParse(answers.reqURL.trim());

            let params = Object.assign({}, opts, {
                parentPath: answers.mockerParentPath,
                isInitReadme: answers.isInitReadme,
                config: {
                    method: answers.method,
                    name: answers.mockerName,
                    route: urlParseResult.pathname,
                    host: urlParseResult.host
                }
            });

            // console.log('--params--', params);

            mockstarGenerators.initMocker(params)
                .then(() => {
                    callback(true);
                })
                .catch((err) => {
                    callback(false, err);
                });
        });
};
