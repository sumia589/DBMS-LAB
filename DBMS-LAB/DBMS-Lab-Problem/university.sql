use university;
select name
from instructor
where salary>any(
select salary from instructor
where dept_name='Biolog'
);
select name
from student
where id in(
select id from takes where course_id='CS-101');
select  s.name
from student s join takes t
on s.id=t.id
where t.course_id='CS-101';

update instructor
set salary=salary*1.05 where dept_name='Comp.Sci.';
set sql_safe_updates=0;
delete from student where tot_cred<40;

select name 
from student
where id not in(
select id from takes);

select sum(credits)
from course
where dept_name='Comp.Sci.';
update department
set budget=budget*0.95;

delimiter //
create procedure get_dept_instructors( in dept varchar(20))
begin
select id,name 
from instructor
where dept=dept_name;
end //
delimiter ;

call get_dept_instructors('Comp. Sci');

delimiter //
create procedure register_student(in s_id varchar(10),in c_id varchar(10),in sc_id varchar(10),in sem varchar(10),in y int)
begin
insert into takes(ID, course_id, sec_id, semester, year, grade) values(s_id, c_id, sc, sem, y, NULL);
end //
delimiter ;

delimiter //
create procedure found_salary(in sal varchar(10))
begin 
select id,name,salary
from instructor
where salary>sal;
end //
delimiter ;
call found_salary(1000);

