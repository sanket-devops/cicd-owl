import paramiko
import sys
import os

def ssh_conn(host, username, password, commandsArr):
    hostName = host
    hostUser = username
    hostPass = password
    commands = commandsArr
    results = []
    os.system("ssh-keygen -R {}".format(hostName))
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostName, username=hostUser, password=hostPass)
    for command in commands:
        temp = []
        ssh_stdin, ssh_stdout, ssh_stderr = client.exec_command(command)
        for line in ssh_stdout:
            nRemove = line.strip('\n')
            temp.append(nRemove)
        results.append(temp)
    print("Host: ", hostName,"\nData: ", results)
    return results
