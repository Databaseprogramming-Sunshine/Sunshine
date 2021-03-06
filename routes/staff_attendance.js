var express = require("express");
var app = express();
var router = express.Router();
var connection = require("../config/db");//디비 사용위해 필요, connection.query()식으로 사용
var timer = require("../public/SCRIPT/timer.js");
var url = require('url');//url의 queryString에서 강의id를 추출하기 위해 사용


router.get("/", function (req, res) {
	var _url = req.url;
	var queryData = url.parse(_url, true).query;

  if (req.session.uid) {    
	connection.query(
		"select * from staff where staff_id=?",
		[req.session.uid],
		function(err, rows){
			if(rows.length){
				if(rows[0].staff_id === req.session.uid){
					var context = [rows[0].staff_id, rows[0].staff_name];
					const context1 = [];
					
					//강의 정보 띄워주기
					connection.query(
						"SELECT date_format(course_date, '%Y-%m-%d') AS course_date, course_name, course_num FROM course WHERE course_id=?;",
						[queryData.id],
						function(err1, rows1){
							if(err1){
								throw err1;
							}
							var context1 = [rows1[0].course_name, rows1[0].course_date, rows1[0].course_num];	
							const context2 = [];												
							
							//유효한 정보가 있는지 확인하는 코드
							connection.query(
								"SELECT att_valid FROM course WHERE course_id=?",
								[queryData.id],
								function(err2, rows2){
									if(err2){
										throw err2;
									}
									
									var valid = rows2[0].att_valid;

									if(valid){//유효한 인증 번호가 있을 경우
										connection.query( 
											"SELECT course_id, date_format(attendance_date, '%Y년 %m월 %d일 ') AS att_date, degree, attendance_personnel AS atts, attendance_num AS att_num, date_format(attendance_time, '%H시 %i분 %s초') AS att_time FROM attendance_info WHERE course_id=? AND att_valid = 1 ",
										[queryData.id],
										function(err3,rows3){
											if(err3){
												throw err3;
											}
											if(rows3){//유효한 인증 번호 불러서 띄워주기
													//끝나는 시각 계산
													var endHour = parseInt((rows3[0].att_time).substring(0,2));    
													var endMin = parseInt((rows3[0].att_time).substring(4,6)) + 10;
													var endSec = parseInt((rows3[0].att_time).substring(8,10));
													if (endMin > 60) { //끝나는 시각이 새로운 시로 변경되는 경우
														endMin = endMin - 60;
														endHour = endHour + 1;
													}
													var endTime = endHour + "시 " + endMin + "분 " + endSec + "초";

													var context2 = [rows3[0].att_num, ''.concat(rows3[0].degree, '차시'), rows3[0].att_date, rows3[0].att_time, rows3[0].course_id, endTime];

													res.render("staff_attendance", {data: context, course: context1, att: context2 });
											}
										});
											
									}
									else{ //유효한 인증 번호가 없을 경우 빈화면 띄워주기 
										connection.query(
											"SELECT max(degree) as max FROM attendance_info WHERE course_id=?",
											[queryData.id],
											function(err4,rows4){
												if(err4) throw err4;
												var degree = rows4[0].max + 1;
												console.log("불러온 차시: "+degree);
												var context2 = ["인증 번호를 생성하세요", ''.concat(degree, '차시'), "", "", queryData.id];
												res.render("staff_attendance", {data: context, course: context1, att: context2 });
											}
										);
									}
								}
							);
						}
					);
				}
			}
		}
	);
 
  } else {
    res.write(
      "<script type='text/javascript'>alert('Please log in');</script>"
    );
    res.write("<script type='text/javascript'>location.href='/login'</script>");
  }
});

module.exports = router;
