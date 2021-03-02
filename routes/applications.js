var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var Status = require('./applicationStatusSchema');
var Application = require('./applicationSchema');

router.get('/', function (req, res, next) {
    ejs.renderFile('../views/index.ejs', {}, (err, data) => {
        res.writeHead(200, {
            'Content-Type': 'text/html;charset="utf-8'
        });
        res.end(data)
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
            docs.filter(item => {
                if (item.department_status !== '0') {
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
            docs.filter(item => {
                if (item.logistics_status !== '0') {
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
            docs.filter(item => {
                if (item.school_dean_status !== '0') {
                    return false
                }
                return true

            })
            res.send({
                code: 20000,
                data: docs.reverse()
            });
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
    }

});

//  增加申请
router.post('/add', function (req, res, next) {
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
    res.send({
        code: 20000,
        msg: '添加成功!'
    })
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