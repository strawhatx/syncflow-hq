// Strategy pattern for rendering connection fields

import * as yup from "yup";
import { Connector } from "@/types/connectors";
import { PostgresFieldsStrategy } from "./postgres";
import { MongoFieldsStrategy } from "./mongo";
import { MySQLFieldsStrategy } from "./mysql";
import { S3FieldsStrategy } from "./aws";

export interface ConnectionFieldsStrategy {
    getDefaults(): Record<string, any>;
    getSchema(): yup.ObjectSchema<any>;
    renderFields(config?: Record<string, any>, setConfig?: (config: Record<string, any>) => void, errors?: Record<string, string>): React.ReactNode
}

class DefaultFieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            name: ""
        }
    }
    getSchema(): yup.ObjectSchema<any> {
        return yup.object().shape({
            name: yup.string().required(),
        })
    }
    renderFields(): React.ReactNode {
        return (
            <></>
        );
    }
}

export class ConnectionFieldsStrategyFactory {
    static getStrategy(connector: Connector): ConnectionFieldsStrategy {
        switch (connector.provider) {
            case "postgresql":
                return new PostgresFieldsStrategy();
            case "mongodb":
                return new MongoFieldsStrategy();
            case "mysql":
                return new MySQLFieldsStrategy();
            case "aws":
                return new S3FieldsStrategy();

            default:
                return new DefaultFieldsStrategy();
        }
    }
}
