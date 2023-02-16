import { List, ListItem, ListItemButton, Paper, Divider } from "@mui/material";

import "./styles.css";

export interface ListDisplayItem<T = React.ReactNode> {
    content: T;
    clickable?: boolean;
}

export interface ListDisplayProps<V = any> {
    items: V[];
    divideItems?: boolean;
    onListItemClick?: (item: ListDisplayItem, originalValue: V) => void;
    itemFormatter: (item: V[][number], index: number) => ListDisplayItem;
    style: React.CSSProperties
}

const ListDisplay: React.FC<ListDisplayProps> = ({
    items,
    onListItemClick,
    itemFormatter,
    divideItems,
    style
}) => {
    return (
        <Paper className="list-display-container" style={style}>
            <List className="list-display-list">
                {
                    items.map((item, index) => {
                        const formattedItem = itemFormatter(item, index);
                        return (
                            formattedItem.clickable 
                            ?
                            <>
                                <ListItemButton
                                    key={index}
                                    onClick={() => onListItemClick?.(formattedItem, item)}
                                    className="list-display-list-item-button"
                                >
                                    {formattedItem.content}
                                </ListItemButton>
                                {
                                    index != items.length - 1 && divideItems
                                    ? <Divider />
                                    : <></>
                                }
                            </>
                            : 
                            <>
                                <ListItem
                                    key={index}
                                    className="list-display-list-item"
                                >
                                    {formattedItem.content}
                                </ListItem>
                                {
                                    index != items.length - 1 && divideItems
                                    ? <Divider />
                                    : <></>
                                }
                            </>
                        )
                    })
                }
            </List>
        </Paper>
    );
}

export default ListDisplay;