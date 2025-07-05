// Strategy pattern for rendering connection fields

import { z } from "zod";
import { Connector } from "@/types/connectors";
import { PostgresFieldsStrategy } from "./postgres";
import { MongoFieldsStrategy } from "./mongo";
import { MySQLFieldsStrategy } from "./mysql";
import { S3FieldsStrategy } from "./aws";

export interface ConnectionFieldsStrategy {
    getDefaults(): Record<string, any>;
    getSchema(): z.ZodObject<any>;
    renderFields(config?: Record<string, any>, setConfig?: (config: Record<string, any>) => void, errors?: Record<string, string>): React.ReactNode
}

class DefaultFieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            name: ""
        }
    }
    getSchema(): z.ZodObject<any> {
        return z.object({
            name: z.string().min(1, "Name is required"),
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
