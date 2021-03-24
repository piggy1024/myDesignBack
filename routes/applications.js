var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var Status = require('./applicationStatusSchema');
var Application = require('./applicationSchema');
// 用户总申请数
var userApplyCount = 0;
// 用户当前生效申请个数
var userActiveCount = 0;
// 用户处于申请状态的个数
var userApplyingCount = 0;

router.get('/', function (req, res, next) {
    ejs.renderFile('../views/index.ejs', {}, (err, data) => {
        res.writeHead(200, {
            'Content-Type': 'text/html;charset="utf-8'
        });
        res.end(data)
    })
});

// 查询用户申请相关数据
router.get('/userApplyData', function (req, res, next) {
    userApplyingCount = 0
    userActiveCount = 0
    userApplyCount = 0
    //子表关联主表查询，populate里面为子表外键
    Status.find({
        stu_status_id: req.query.user_id
        // stu_status_id: "17251106123"
    }).populate('app_id').exec(function (err, docs) {
        if (err) {
            console.log(err);
            return;
        }
        // console.log(docs);
        docs.forEach(item => {
            if (item.app_id.status === 0) {
                userApplyingCount++
            }
            if (item.technology_center_status === '1') {
                if (item.app_id.app_end_time < new Date()) {
                    // console.log('item.app_id.app_end_time:', item.app_id.app_end_time);
                    // console.log('new Date():', new Date());
                    userActiveCount++
                }
            }
        })
        userApplyCount = docs.length
        res.send({
            code: 20000,
            data: {
                userActiveCount: userActiveCount,
                userApplyingCount: userApplyingCount,
                userApplyCount: userApplyCount
            }
        });
    })
});


// 根据学生id查询申请进度列表
router.get('/applyProcess', function (req, res, next) {
    // Application.find({
    //     "stu_id": req.query.user_id
    // }).populate('_id').exec(function (err, docs) {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     res.send({
    //         code: 20000,
    //         data: docs
    //     });
    // })

    //子表关联主表查询，populate里面为子表外键
    Status.find({
        stu_status_id: req.query.user_id
    }).populate('app_id').exec(function (err, docs) {
        if (err) {
            console.log(err);
            return;
        }
        res.send({
            code: 20000,
            data: docs.reverse()
        });
    })

});

// 未审批列表
router.get('/auditList', function (req, res, next) {
    // 根据不同部门的人筛选出不同部门未审批的申请
    if (req.query.apartment === "部门") {
        Status.find({
            department_status: "0"
        }).populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else if (req.query.apartment === "后勤处") {
        Status.find({
            logistics_status: "0"
        }).populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            docs = docs.filter(item => {
                if (item.department_status !== '1') {
                    return false
                }
                return true

            })
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else if (req.query.apartment === "教务处") {
        Status.find({
            school_dean_status: "0"
        }).populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            docs = docs.filter(item => {
                if (item.logistics_status !== '1') {
                    return false
                }
                return true

            })
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else if (req.query.apartment === "教育技术中心") {
        Status.find({
            technology_center_status: "0"
        }).populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            docs = docs.filter(item => {
                if (item.school_dean_status !== '1') {
                    return false
                }
                return true

            })
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else {
        // 其它部门
        res.send({
            code: 20000,
            data: []
        })
    }

    // Application.find({
    //     "status": 0
    // }, async (err, doc) => {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     res.send({
    //         code: 20000,
    //         data: doc
    //     });
    // })



    // Application.aggregate([{
    //     $match: {
    //         "stu_id": '17251106123'
    //     }
    // }, {
    //     $lookup: {
    //         from: 'applications_status',
    //         localField: '_id',
    //         foreignField: 'app_id',
    //         as: 'itemCollect'
    //     }
    // }], (err, doc) => {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     res.send({
    //         code: 20000,
    //         data: doc
    //     });
    // })

});

// 已审批列表
router.get('/auditedList', function (req, res, next) {

    // 0 是未审批 1 是审批通过 2 是审批驳回
    // Application.$where('this.status !== 0').exec((err, docs) => {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     res.send({
    //         code: 20000,
    //         data: docs
    //     });
    // })


    // 根据不同部门的人筛选出不同部门已审批的申请
    if (req.query.apartment === "部门") {
        Status.$where('this.department_status !== "0"').populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else if (req.query.apartment === "后勤处") {
        Status.$where('this.logistics_status !== "0"').populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else if (req.query.apartment === "教务处") {
        Status.$where('this.school_dean_status !== "0"').populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else if (req.query.apartment === "教育技术中心") {
        Status.$where('this.technology_center_status !== "0"').populate('app_id').exec(function (err, docs) {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: docs.reverse()
            });
        })
    } else {
        // 其它部门
        res.send({
            code: 20000,
            data: []
        })
    }

});

//  增加申请
router.post('/add', async function (req, res, next) {
    console.log(req.query);
    var isConflict = false;
    var conflictCount = 0;
    var notConflictCount = 0;
    let delayWithPromise = () => {
        return new Promise((resolve, reject) => {
            req.query.addList.forEach((item, index) => {
                isConflict = false
                Application.find({
                    "c_id": item,
                    "app_end_time": {
                        "$gt": new Date()
                    }
                }, async (err, docs) => {
                    if (err) {
                        console.log(err);
                    }
                    // console.log('变化前isConflict-', isConflict);
                    if (isConflict) {
                        // 判断每个申请前先将isConflict 置为 false
                        isConflict = false
                    }
                    // console.log('docs-----', docs);
                    docs.forEach(item => {
                        if (validTime(item.app_start_time, item.app_end_time, new Date(req.query.app_start_time), new Date(req.query.app_end_time))) {
                            console.log("不冲突!");
                        } else {
                            isConflict = true
                            console.log("冲突!");
                        }

                    })
                    if (isConflict) {
                        // 如果冲突
                        // res.send({
                        //     code: 10000,
                        //     message: '时间冲突添加失败!'
                        // })
                        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!冲突');
                        // 冲突一个 conflictCount+1
                        conflictCount = conflictCount + 1;
                    } else {
                        notConflictCount = notConflictCount + 1;
                        // 如果不冲突
                        req.query.c_id = item
                        Application.create(req.query, (err, docs) => {
                            if (err) {
                                console.log(err);
                            }
                            // 增加一个申请上来 要对应增加该申请的各部门审批状态（各部门状态是独立的collection）
                            Status.create({
                                app_id: docs._id,
                                department_reason: '',
                                logistics_reason: '',
                                school_dean_reason: '',
                                technology_center_reason: '',
                                stu_status_id: req.query.stu_id
                            }, (err, docs) => {
                                if (err) {
                                    console.log(err);
                                }
                            })
                        })
                        // res.send({
                        //     code: 20000,
                        //     msg: '添加成功!'
                        // })
                    }
                    if (index + 1 === req.query.addList.length) {
                        // console.log('++++length', req.query.addList.length);
                        resolve()
                    }
                })

            })

        })
    }
    let func2 = () => {
        delayWithPromise().then(res1 => {
            console.log('111111--------', conflictCount);
            console.log('222--------', notConflictCount);
            if (conflictCount) {
                // 如果冲突
                res.send({
                    code: 10000,
                    message: `${conflictCount}个申请失败!${notConflictCount}个申请成功!`
                })
            } else {
                res.send({
                    code: 20000,
                    msg: '添加成功!'
                })
            }
        })
    }
    func2()



    // Application.find({
    //     "c_id": req.query.c_id,
    //     "app_end_time": {
    //         "$gt": new Date()
    //     }
    // }, (err, docs) => {
    //     if (err) {
    //         console.log(err);
    //     }
    //     console.log(docs);
    //     docs.forEach(item => {
    //         if (validTime(item.app_start_time, item.app_end_time, new Date(req.query.app_start_time), new Date(req.query.app_end_time))) {
    //             console.log("不冲突!");
    //         } else {
    //             isConflict = true
    //             console.log("冲突!");
    //         }

    //     })
    //     if (isConflict) {
    //         // 如果冲突
    //         res.send({
    //             code: 10000,
    //             message: '时间冲突添加失败!'
    //         })
    //     } else {
    //         // 如果不冲突
    //         Application.create(req.query, (err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //             // 增加一个申请上来 要对应增加该申请的各部门审批状态（各部门状态是独立的collection）
    //             Status.create({
    //                 app_id: docs._id,
    //                 department_reason: '',
    //                 logistics_reason: '',
    //                 school_dean_reason: '',
    //                 technology_center_reason: '',
    //                 stu_status_id: req.query.stu_id
    //             }, (err, docs) => {
    //                 if (err) {
    //                     console.log(err);
    //                 }
    //             })
    //         })
    //         res.send({
    //             code: 20000,
    //             msg: '添加成功!'
    //         })
    //     }
    // })
    // 判断两个时间段是否冲突的js方法
    function validTime(a, b, x, y) {
        if (y <= a || b <= x) {
            // console.log("true不");
            // 不冲突返回true
            return true
        } else {
            // console.log("false冲突");
            // 冲突返回false
            return false
        }
    }
})

//  修改申请
router.post('/edit', function (req, res, next) {
    var isConflict = false;
    Application.find({
        "c_id": req.query.c_id,
        "app_end_time": {
            "$gt": new Date() // 只查询今天之后的申请是否存在冲突
        }
    }, (err, docs) => {
        if (err) {
            console.log(err);
        }
        // 过滤其自身
        docs = docs.filter(item => {
            return item._id + '' !== req.query._id // + ''是将_id转化称字符串  数据库中的_id不是字符串
        })
        docs.forEach(item => {
            if (validTime(item.app_start_time, item.app_end_time, new Date(req.query.app_start_time), new Date(req.query.app_end_time))) {
                console.log("不冲突!");
            } else {
                isConflict = true
                console.log("冲突!");
            }
        })
        if (isConflict) {
            // 如果冲突
            res.send({
                code: 10000,
                message: '时间冲突修改失败!'
            })
        } else {
            // 如果不冲突
            Application.findByIdAndUpdate(req.query._id, req.query, (err, docs) => {
                if (err) {
                    console.log(err);
                }
            })
            res.send({
                code: 20000,
                msg: '修改成功!'
            })
        }
    })
    // 判断两个时间段是否冲突的js方法
    function validTime(a, b, x, y) {
        if (y <= a || b <= x) {
            // console.log("true不");
            // 不冲突返回true
            return true
        } else {
            // console.log("false冲突");
            // 冲突返回false
            return false
        }
    }
})

// 取消申请
router.post('/deleteApply', function (req, res, next) {
    // 取消一个申请要分别删除申请表和状态表的文档
    Application.deleteOne({
            '_id': req.query._id
        }, //查找条件
        /*回调函数*/
        (err, docs) => {
            if (err) {
                return console.log('删除数据失败')
            }
            console.log(docs);
        }
    )
    Status.deleteOne({
            'app_id': req.query._id
        }, //查找条件
        /*回调函数*/
        (err, docs) => {
            if (err) {
                return console.log('删除数据失败')
            }
            console.log(docs);
        }
    )
    res.send({
        code: 20000,
        msg: '取消成功!'
    })
})

// 审批通过
router.post('/resolveApply', function (req, res, next) {
    // 部门审批 教务处审批 后勤处审批 教育技术中心审批
    if (req.query.apartment === '部门') {
        Application.updateOne({
            "_id": req.query._id
        }, {
            "reason": req.query.reason,
            "app_passTime": req.query.app_passTime,
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            Status.updateOne({
                "app_id": req.query._id
            }, {
                "department_reason": req.query.reason,
                "department_status": "1" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    } else if (req.query.apartment === "后勤处") {
        Application.updateOne({
            "_id": req.query._id
        }, {
            "reason": req.query.reason,
            "app_passTime": req.query.app_passTime,
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            Status.updateOne({
                "app_id": req.query._id
            }, {
                "logistics_reason": req.query.reason,
                "logistics_status": "1" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    } else if (req.query.apartment === "教务处") {
        Application.updateOne({
            "_id": req.query._id
        }, {
            "reason": req.query.reason,
            "app_passTime": req.query.app_passTime,
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            Status.updateOne({
                "app_id": req.query._id
            }, {
                "school_dean_reason": req.query.reason,
                "school_dean_status": "1" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    } else if (req.query.apartment === "教育技术中心") {
        Application.updateOne({
            "_id": req.query._id
        }, {
            "reason": req.query.reason,
            "app_passTime": req.query.app_passTime,
            "status": 1 // 只有最后个部门审批之后才会改application表的status状态
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            Status.updateOne({
                "app_id": req.query._id
            }, {
                "technology_center_reason": req.query.reason,
                "technology_center_status": "1" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    }

})

// 审批驳回
router.post('/rejectApply', function (req, res, next) {
    // Application.updateOne({
    //     "_id": req.query._id
    // }, {
    //     "reason": req.query.reason,
    //     "app_passTime": req.query.app_passTime,
    //     "status": 2
    // }, (err, response) => {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     console.log(response);
    //     res.send({
    //         code: 20000,
    //         data: {
    //             msg: '编辑修改成功!'
    //         }
    //     })
    // })
    // 部门审批 教务处审批 后勤处审批 教育技术中心审批
    if (req.query.apartment === '部门') {
        Application.updateOne({
            "_id": req.query._id
        }, {
            "reason": req.query.reason,
            "app_passTime": req.query.app_passTime,
            "status": 2
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            Status.updateOne({
                "app_id": req.query._id
            }, {
                "department_reason": req.query.reason,
                "department_status": "2" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    } else if (req.query.apartment === "后勤处") {
        Application.updateOne({
            "_id": req.query._id
        }, {
            "reason": req.query.reason,
            "app_passTime": req.query.app_passTime,
            "status": 2
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            Status.updateOne({
                "app_id": req.query._id
            }, {
                "logistics_reason": req.query.reason,
                "logistics_status": "2" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    } else if (req.query.apartment === "教务处") {
        Application.updateOne({
            "_id": req.query._id
        }, {
            "reason": req.query.reason,
            "app_passTime": req.query.app_passTime,
            "status": 2
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            Status.updateOne({
                "app_id": req.query._id
            }, {
                "school_dean_reason": req.query.reason,
                "school_dean_status": "2" // 审批通过是"1"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    } else if (req.query.apartment === "教育技术中心") {
        Application.updateOne({
            "_id": req.query._id
        }, {
            "reason": req.query.reason,
            "app_passTime": req.query.app_passTime,
            "status": 2
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            Status.updateOne({
                "app_id": req.query._id
            }, {
                "technology_center_reason": req.query.reason,
                "technology_center_status": "2" // 审批驳回是"2"
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({
                    code: 20000,
                    data: {
                        msg: '编辑修改成功!'
                    }
                })
            })

        })
    }
})

// 撤回审批
router.post('/withdrawApply', function (req, res, next) {
    // 无论哪个部门撤回审批后,审批结果都是 审批中
    Application.updateOne({
        "_id": req.query._id
    }, {
        "app_passTime": new Date(),
        "reason": "暂时撤回审批",
        "status": 0
    }, (err, response) => {
        if (err) {
            console.log(err);
            return;
        }

    })

    if (req.query.apartment === '部门') {
        Status.updateOne({
            "app_id": req.query._id
        }, {
            "department_reason": "",
            "department_status": "0"
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: {
                    msg: '撤回成功!'
                }
            })
        })
    } else if (req.query.apartment === "后勤处") {
        Status.updateOne({
            "app_id": req.query._id
        }, {
            "logistics_reason": "",
            "logistics_status": "0"
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: {
                    msg: '撤回成功!'
                }
            })
        })
    } else if (req.query.apartment === "教务处") {
        Status.updateOne({
            "app_id": req.query._id
        }, {
            "school_dean_reason": "",
            "school_dean_status": "0"
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: {
                    msg: '撤回成功!'
                }
            })
        })
    } else if (req.query.apartment === "教育技术中心") {
        Status.updateOne({
            "app_id": req.query._id
        }, {
            "technology_center_reason": "",
            "technology_center_status": "0"
        }, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send({
                code: 20000,
                data: {
                    msg: '撤回成功!'
                }
            })
        })
    }
})

module.exports = router;