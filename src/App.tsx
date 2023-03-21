import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

type Node = {
    id: string;
    cashierId: number;
    itemsCount: number;
};

type Cashier = {
    id: number;
    queue: Array<Node>;
};

const createNode = (itemsCount: number, cashierId: number): Node => {
    return {
        id: Math.random().toString(36).substring(7),
        cashierId,
        itemsCount: itemsCount,
    };
};

const generateCashiers = (count: number): Array<Cashier> => {
    return Array.from({ length: count }, (_, i) => {
        return {
            id: i + 1,
            queue: [],
        };
    });
};

function App() {
    const [cashiers, setCashiers] = useState<Array<Cashier>>(
        generateCashiers(5)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCashiers((prev) => [
                ...prev.reduce((acc: Array<Cashier>, cashier: Cashier) => {
                    const updatedCashier = {
                        ...cashier,
                        queue: cashier.queue.reduce(
                            (acc: Array<Node>, node: Node, idx: number) => {
                                if (idx === 0) {
                                    node.itemsCount -= 1;
                                    if (node.itemsCount > 0) {
                                        acc.push(node);
                                    }
                                } else {
                                    acc.push(node);
                                }

                                return acc;
                            },
                            []
                        ),
                    };
                    acc.push(updatedCashier);
                    return acc;
                }, []),
            ]);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // select cashierid with least items in queue
    const selectCashierWithLeastItems = () => {
        let cashierWithLeastItems = null;
        let currentLowestItemCount = Infinity;
        for (let i = 0; i < cashiers.length; i++) {
            const cashier = cashiers[i];
            if (cashier.queue.length === 0) {
                return cashier.id;
            }
            if (cashierWithLeastItems === null) {
                cashierWithLeastItems = cashier;
                currentLowestItemCount = cashier.queue.reduce(
                    (acc, node) => acc + node.itemsCount,
                    0
                );
                continue;
            }
            const itemCountInCurrentCashier = cashier.queue.reduce((acc, node) => acc + node.itemsCount, 0)
            if (cashier.queue.reduce((acc, node) => acc + node.itemsCount, 0) < currentLowestItemCount) {
                cashierWithLeastItems = cashier;
                currentLowestItemCount = itemCountInCurrentCashier;
            }
        }
        if (cashierWithLeastItems === null) {
            throw new Error("No cashiers found");
        }
        return cashierWithLeastItems.id;
    };

    const addNewNode = (itemsCount: number) => {
        const cashierId = selectCashierWithLeastItems();
        setCashiers((prev) => [
          ...prev.map(cashier => {
            if (cashier.id === cashierId) {
              return {
                ...cashier,
                queue: [
                  ...cashier.queue,
                  createNode(itemsCount, cashierId),
                ],
              }
            }
            return cashier;
          })
        ]);
    };

    return (
        <div className="flex flex-col w-full flex-grow gap-10">
            <CheckoutInput onSubmit={addNewNode} />
            <Cashiers cashiers={cashiers} />
        </div>
    );
}

type CashierProps = {
  cashiers: Array<Cashier>
}
const Cashiers = ({ cashiers }: CashierProps) => {
    return (
        <div className="flex flex-row justify-center w-full gap-20">
            {cashiers.map((cashier) => {
                return (
                    <div key={cashier.id} className="flex flex-col justify-start items-start gap-2">
                        <div
                            key={cashier.id}
                            className="flex w-20 h-20 bg-red-500 rounded-full"
                        ></div>

                        {cashier.queue.map((node) => {
                            return (
                                <div
                                    key={node.id}
                                    className="flex relative w-20 h-20 bg-gray-600 rounded-full"
                                >
                                    <span
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        {node.itemsCount}
                                        </span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

const CheckoutInput = ({ onSubmit }: any) => {
    const [inputValue, setInputValue] = useState("");
    return (
        <form
            className="flex flex-row justify-center w-full"
            onSubmit={(e) => {
                e.preventDefault();
                setInputValue("");
                onSubmit(parseInt(inputValue));
            }}
        >
            <div className="flex flex-row justify-center w-full gap-2">
                <div className="flex flex-row">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
                <div className="flex flex-row">
                    <button type="submit" className="bg-black rounded-md p-2">
                        checkout
                    </button>
                </div>
            </div>
        </form>
    );
};

export default App;
