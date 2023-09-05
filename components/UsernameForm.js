/*
- user inputs their username
- user clicks submit
- submit calls a function that makes api call to 
- Check if username is taken and already associated with a DID and already stored in DWN
- if not, it generates a DID and associates it with the username
- if yes, it lets the user know that the username is taken
- add validation to the form:
    - no empty submissions
    - alphanumeric accepted
    - only special characters allowed are . and _
*/

import React, { useState } from 'react';
import { Web5 } from '@tbd54566975/web5';
import { Alert, Button, Form, Input, Typography } from 'antd';
import styles from './UsernameForm.module.css'
const { Title, Text } = Typography;

const UsernameForm = () => {
    const [validateStatus, setValidateStatus] = useState('');
    const [helpText, setHelpText] = useState('');

    const createAlias = async (web5, username) => {
        const newDid = await Web5.did.create('ion');
        const { record } = await web5.dwn.records.create({
            data: {
                alias: username,
                did: newDid.id
            },
            message: {
                dataFormat: 'application/json',
                schema: 'https://schema.org/name'
            },
        });
        const recordData = await record.data.json();
        console.log('Created new alias (Username):', recordData.alias);
    };

    const queryRecords = async (web5) => {
        const response = await web5.dwn.records.query({
            message: {
                filter: {
                    dataFormat: 'application/json',
                    schema: 'https://schema.org/name'
                }
            }
        });
        return response
    };

    const isUsernameTaken = async (web5, username) => {
        const { records } = await queryRecords(web5, username);

        const recordDataPromises = records.map(record => record.data.json());
        const recordDataArray = await Promise.all(recordDataPromises);

        const isFound = recordDataArray.some(recordData => recordData.alias === username);

        console.log('isFound:', isFound);
        return isFound;
    };

    const onFinish = async (values) => {
        const { username } = values;
        const { web5 } = await Web5.connect();

        const isTaken = await isUsernameTaken(web5, username);

        if (isTaken) {
            setValidateStatus('error');
            setHelpText('Username is already taken.');
            console.log('Username is already taken.');
        } else {
            setValidateStatus('success');
            setHelpText('');
            await createAlias(web5, username);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className={styles.formContainer}>
            <Title level={2} className={styles.title}>Create a Username</Title>
            <Text className={styles.description}>Choose a unique username to associate with your DID.</Text>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                className={styles.usernameForm}
            >
                <div className={styles.flexContainer}>
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username!',
                            },
                            {
                                pattern: /^[a-zA-Z0-9._]+$/,
                                message: 'Only alphanumeric characters, . and _ are allowed',
                            }
                        ]}
                        validateStatus={validateStatus === 'error' ? 'error' : undefined}
                        help={validateStatus === 'error' ? helpText : undefined}
                    >
                        <Input />
                    </Form.Item>
                    <Button htmlType="submit" className={styles.submitButton}>
                        Submit
                    </Button>
                </div>

                {validateStatus === 'success' && (
                    <Alert message="Username successfully created!" type="success" showIcon />
                )}
            </Form>
        </div>
    );
};

export default UsernameForm;
