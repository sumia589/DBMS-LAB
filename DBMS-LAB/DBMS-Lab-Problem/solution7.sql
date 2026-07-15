DROP TRIGGER IF EXISTS update_tot_cred;

DELIMITER //

CREATE TRIGGER update_tot_cred
AFTER UPDATE ON takes
FOR EACH ROW
BEGIN
IF OLD.grade IS NULL AND NEW.grade IN ('A','B','C') THEN
        
UPDATE student
SET tot_cred = tot_cred + (
SELECT credits 
FROM course 
WHERE course.course_id = NEW.course_id
)
WHERE student.ID = NEW.ID;

END IF;
END //

DELIMITER ;