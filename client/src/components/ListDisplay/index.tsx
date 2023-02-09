import {
    List,
    ListItem,
    ListItemButton,
    Paper,
    Divider,
    Button,
    Input,
} from '@mui/material'

import './styles.css'
import { Add, Delete } from '@mui/icons-material'
import { useState } from 'react'

export interface ListDisplayItem<T = React.ReactNode> {
    content: T
    clickable?: boolean
}

export interface ListDisplayProps<T> {
    items: T[]
    header?: React.ReactNode
    divideItems?: boolean
    onListItemClick?: (
        item: ListDisplayItem,
        originalValue: T,
        index: number
    ) => void
    itemFormatter: (item: T, index: number) => ListDisplayItem
    onListItemAdd?: () => void
    onListItemAddAbort?: () => void
    onListItemSubmit?: (value: string) => void
    onListItemDelete?: (
        item: ListDisplayItem,
        originalValue: T,
        index: number
    ) => void
    editable?: boolean
    deletable?: boolean
    paperProps?: React.ComponentProps<typeof Paper>
    style?: React.CSSProperties
    className?: string
}

function ListDisplay<T>({
    items,
    header,
    onListItemClick,
    onListItemAdd,
    onListItemSubmit,
    onListItemAddAbort,
    onListItemDelete,
    itemFormatter,
    divideItems,
    editable,
    deletable,
    style,
    className,
    paperProps,
}: ListDisplayProps<T>) {
    const [attemptingListItemAdd, setAttemptingListItemAdd] = useState(false)

    const onTemporaryListItemAdd = () => {
        setAttemptingListItemAdd(true)
        onListItemAdd?.()
    }

    const onTemporaryListItemSubmit = (value: string) => {
        setAttemptingListItemAdd(false)
        onListItemSubmit?.(value)
    }

    const onTemporaryListItemAbort = () => {
        setAttemptingListItemAdd(false)
        onListItemAddAbort?.()
    }

    const onListItemDeleteClick = (
        item: ListDisplayItem,
        originalValue: T,
        index: number
    ) => {
        onListItemDelete?.(item, originalValue, index)
    }

    return (
        <Paper
            className={`list-display-container ${className}`}
            style={style}
            {...paperProps}
        >
            {header}
            <List className='list-display-list'>
                {items.map((item, index) => {
                    const formattedItem = itemFormatter(item, index)
                    return formattedItem.clickable ? (
                        <ListItem>
                            {deletable ? (
                                <Button
                                    className='list-display-delete-button'
                                    onClick={() =>
                                        onListItemDeleteClick(
                                            formattedItem,
                                            item,
                                            index
                                        )
                                    }
                                >
                                    <Delete />
                                </Button>
                            ) : (
                                <></>
                            )}
                            <ListItemButton
                                key={index}
                                onClick={() =>
                                    onListItemClick?.(
                                        formattedItem,
                                        item,
                                        index
                                    )
                                }
                                className='list-display-list-item-button'
                            >
                                {formattedItem.content}
                            </ListItemButton>
                            {index != items.length - 1 && divideItems ? (
                                <Divider />
                            ) : (
                                <></>
                            )}
                        </ListItem>
                    ) : (
                        <>
                            <ListItem
                                key={index}
                                className='list-display-list-item'
                            >
                                {formattedItem.content}
                            </ListItem>
                            {index != items.length - 1 && divideItems ? (
                                <Divider />
                            ) : (
                                <></>
                            )}
                        </>
                    )
                })}
                {editable && attemptingListItemAdd ? (
                    <Input
                        className='list-display-add-input'
                        autoFocus
                        onBlur={() => onTemporaryListItemAbort()}
                        onKeyDown={(event) => {
                            if (event.key == 'Enter') {
                                onTemporaryListItemSubmit(
                                    event.currentTarget.value
                                )
                            }
                        }}
                    />
                ) : (
                    <></>
                )}
            </List>
            {editable ? (
                <Button
                    className='list-display-add-button'
                    onClick={() => onTemporaryListItemAdd()}
                    disabled={attemptingListItemAdd}
                    fullWidth
                >
                    <Add />
                </Button>
            ) : (
                <></>
            )}
        </Paper>
    )
}

export default ListDisplay
