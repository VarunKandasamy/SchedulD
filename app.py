from flask import Flask, request, render_template
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
conn = psycopg2.connect(
    host=os.getenv('host'),
    database=os.getenv('database'),
    user=os.getenv('user'),
    password=os.getenv('password')
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/students', methods=['POST'])
def storeStudent():
    query = request.get_json()

    name = query.get('name')
    email = query.get('email')
    if name == None:
        return "invalid name", 400
    cur = conn.cursor()

    #need to come back and handle failure
    cur.execute("INSERT INTO student (name, email) VALUES (%s, %s);", (name, email))
    conn.commit()
    cur.execute("SELECT id FROM student WHERE name=%s AND email=%s LIMIT 1;", (name,email))
    yourID= cur.fetchone()[0]
    cur.close()

    strID = "Keep this safe. Your ID is: " + str(yourID)
    return strID, 200
    
@app.route('/courses', methods=['POST'])
def storeCourse():
    query = request.get_json()

    name = query.get('name')
    courseNumber = query.get('number')
    department = query.get('department')

    if name == None or courseNumber == None or department == None or len(department) != 4:
        return "invalid inputs", 400
    cur = conn.cursor()

    #Need to first check if the department exists. If it doesn't, create an entry for it
    cur.execute("SELECT count(*) FROM department WHERE prefix=%s;", (department,))
    if(cur.fetchone()[0] == 0):
        cur.execute("INSERT INTO department (prefix) VALUES (%s)", (department,))
        conn.commit()
        print("inserted dept prefix")
    cur.execute("SELECT id FROM department WHERE prefix=%s;", (department,))
    deptID = cur.fetchone()[0]
    print(deptID)
    
    #need to come back and handle failure
    cur.execute("INSERT INTO course (name, courseNumber, departmentID) VALUES (%s, %s, %s)", (name, courseNumber, deptID))
    conn.commit()
    cur.close()
    return "Success", 200
 
@app.route('/enrollments', methods=['POST'])
def storeEnrollment():
    query = request.get_json()

    studentID = query.get('studentID')
    courseNumber = query.get('number')
    department = query.get('department')

    if studentID == None or courseNumber == None or department == None or len(department) != 4:
        return "invalid inputs", 400
    cur = conn.cursor()

    cur.execute("SELECT id FROM department WHERE prefix=%s;", (department,))
    deptID = cur.fetchone()[0]
    cur.execute("SELECT id FROM course WHERE courseNumber=%s AND departmentID=%s;", (courseNumber, deptID))
    courseID = cur.fetchone()[0]

    #need to come back and handle failure
    cur.execute("INSERT INTO enrollment (studentID, courseID) VALUES (%s, %s)", (studentID, courseID))
    conn.commit()
    cur.close()
    return "Success", 200

@app.route('/students/<int:studentID>',methods=['DELETE'])
def removeStudent(studentID):
    if studentID == None:
        return "invalid name", 400
    cur = conn.cursor()

    #need to come back and handle failure
    cur.execute("DELETE FROM student WHERE id=%s", (studentID,))
    conn.commit()
    cur.close()
    return "Success", 200

   
@app.route('/courses',methods=['DELETE'])
def removeCourse():
    query = request.get_json()

    courseNumber = query.get('number')
    department = query.get('department')

    if courseNumber == None or department == None or len(department) != 4:
        return "invalid inputs", 400
    cur = conn.cursor()

    cur.execute("SELECT id FROM department WHERE prefix=%s;", (department,))
    deptID=cur.fetchone()[0]
    cur.execute("SELECT id FROM course WHERE courseNumber=%s AND departmentID=%s;", (courseNumber, deptID))
    courseID=cur.fetchone()[0]

    #need to come back and handle failure
    cur.execute("DELETE FROM course WHERE id=%s", (courseID,))
    conn.commit()
    cur.close()
    return "Success", 200

@app.route('/enrollments', methods=['DELETE'])
def removeEnrollment():
    query = request.get_json()

    studentID = query.get('studentID')
    courseNumber = query.get('number')
    department = query.get('department')

    if studentID == None or courseNumber == None or department == None or len(department) != 4:
        return "invalid inputs", 400
    cur = conn.cursor()

    cur.execute("SELECT id FROM department WHERE prefix=%s;", (department,))
    deptID=cur.fetchone()[0]
    cur.execute("SELECT id FROM course WHERE courseNumber=%s AND departmentID=%s;", (courseNumber, deptID))
    courseID=cur.fetchone()[0]

    #need to come back and handle failure
    cur.execute("DELETE FROM enrollment WHERE studentID=%s AND courseID=%s", (studentID, courseID))
    conn.commit()
    cur.close()
    return "Success", 200

@app.route('/students/<int:studentID>', methods=['GET'])
def readStudent(studentID):
    cur=conn.cursor()
    cur.execute("SELECT name, email FROM student WHERE id=%s LIMIT 1",(studentID,))
    data = cur.fetchone()
    cur.close()
    
    if data is None:
        return "Could not find student", 400
    return {"name": data[0],"email": data[1]}, 200

@app.route('/courses/find', methods=['POST'])
def readSingleCourse():
    query = request.get_json()
    courseID=query.get('number')
    deptID=query.get('department')

    if not courseID or not deptID:
        return "Both courseID and departmentID are required", 400

    cur=conn.cursor()
    cur.execute("SELECT id FROM department WHERE prefix=%s;", (deptID,))
    deptID=cur.fetchone()[0]

    cur.execute("SELECT name FROM course WHERE courseNumber=%s AND departmentID=%s LIMIT 1",(courseID, deptID))
    data=cur.fetchone()
    cur.close()

    if data is None:
        return "Could not find any matching courses", 400
    return {"name": data[0]}, 200

@app.route('/enrollments', methods=['GET'])
def readAllEnrollment():
    cur=conn.cursor()
    cur.execute("SELECT * FROM enrollment")
    data=cur.fetchall()
    cur.close()

    if data is None:
        return "Could not find any enrollments", 400
    return {"enrollments": [{"courseID":row[1], "studentID": row[0]} for row in data]}, 200

@app.route('/students/<int:studentID>', methods=['PUT'])
def updateStudent(studentID):
    cur=conn.cursor()
    query = request.get_json()
    name = query.get('name')
    email = query.get('email')

    if name is None and email is None:
        return "No fields provided", 400

    if name and email:
        cur.execute("UPDATE student SET name=%s, email=%s WHERE id=%s", (name, email, studentID))
    elif name:
        cur.execute("UPDATE student SET name=%s WHERE id=%s", (name, studentID))
    else:
        cur.execute("UPDATE student SET email=%s WHERE id=%s", (email, studentID))
    conn.commit()
    cur.close()
    
    return "Success", 200

@app.route('/courses', methods=['PUT'])
def updateCourse():
    query = request.get_json()
    name=query.get('name')
    courseID=query.get('number')
    deptID=query.get('department')

    cur=conn.cursor()
    cur.execute("SELECT id FROM department WHERE prefix=%s;", (deptID,))
    deptID=cur.fetchone()[0]
    cur.execute("UPDATE course SET name=%s WHERE courseNumber=%s AND departmentID=%s",(name,courseID, deptID))
    conn.commit()
    cur.close()

    return "Success", 200

if __name__ == "__main__":
    app.run(debug=True)
