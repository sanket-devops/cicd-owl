from flask import Flask, jsonify, request
from src.modules.ssh import ssh_conn

app = Flask(__name__)
incomes = [
    {'description': 'salary', 'amount': 5000}
]

@app.route('/incomes')
def get_incomes():
    return jsonify(incomes)

@app.route('/ssh', methods=['POST'])
def ssh_connection():
    reqData = request.json
    return ssh_conn(reqData["host"], reqData["username"], reqData["password"], reqData["commandsArr"]),200

@app.route("/")
def get_server():
    # sys.exit()
    return "Server is running...",200